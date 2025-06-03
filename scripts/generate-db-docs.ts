import fs from 'node:fs/promises';
import path from 'node:path';
import { sql } from '../src/lib/db';

// --- Types ---
type TableRow = { table_name: string; description: string | null };
type ColumnRow = { column_name: string; data_type: string; is_nullable: string; column_default: string | null; description: string | null };
type ConstraintRow = { constraint_name: string; constraint_type: string; column_name: string; foreign_table_name: string; foreign_column_name: string };
type IndexRow = { indexname: string; indexdef: string };
type TableDoc = TableRow & { columns: ColumnRow[]; constraints: ConstraintRow[]; indexes: IndexRow[] };

async function generateDbDocs() {
  console.log('📊 Generating database documentation...');

  try {
    // Get all tables in the public schema
    const tables = await db.execute<TableRow>(sql`
      SELECT 
        table_name,
        obj_description(('public.' || table_name)::regclass, 'pg_class') as description
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY 
        table_name;
    `) as QueryResult<TableRow>;
      SELECT 
        table_name,
        obj_description(('public.' || table_name)::regclass, 'pg_class') as description
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY 
        table_name;
    `);

    // Get columns for each table
    const tablesWithColumns = await Promise.all(
      tables.rows.map(async (table) => {
        const columnsResult = await db.execute<ColumnDefinition>(sql`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            col_description(('public.' || ${table.table_name})::regclass::oid, ordinal_position) as description
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public' 
            AND table_name = ${table.table_name}
          ORDER BY 
            ordinal_position;
        `) as QueryResult<ColumnDefinition>;

        const columns = columnsResult.rows;

        // Get foreign key constraints
        const constraintsResult = await db.execute<ForeignKeyConstraint>(sql`
          SELECT
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE 
            tc.table_schema = 'public' 
            AND tc.table_name = ${table.table_name}
            AND tc.constraint_type = 'FOREIGN KEY';
        `) as QueryResult<ForeignKeyConstraint>;

        const constraints = constraintsResult.rows;

        // Get indexes
        const indexesResult = await db.execute<IndexDefinition>(sql`
          SELECT
            indexname,
            indexdef
          FROM 
            pg_indexes
          WHERE 
            schemaname = 'public' 
            AND tablename = ${table.table_name};
        `) as QueryResult<IndexDefinition>;

        const indexes = indexesResult.rows;

        return {
          ...table,
          columns,
          constraints,
          indexes
        };
      })
    );

    // Generate markdown documentation
    let markdown = `# Database Schema Documentation\n\n*Generated on ${new Date().toISOString()}*\n\n## Tables\n\n`;
    // Table of contents
    markdown += '### Table of Contents\n\n';
    for (const table of tablesWithColumns) {
      markdown += `- [${table.table_name}](#${table.table_name.toLowerCase()})\n`;
    }
    markdown += '\n';
    // Table details
    for (const table of tablesWithColumns) {
      markdown += `## Table: \`${table.table_name}\`\n\n`;
      if (table.description) markdown += `${table.description}\n\n`;
      // Columns
      markdown += '### Columns\n\n| Name | Type | Nullable | Default | Description |\n|------|------|----------|---------|-------------|\n';
      for (const col of table.columns) {
        markdown += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable === 'YES' ? '✅' : '❌'} | ${col.column_default || 'NULL'} | ${col.description || ''} |\n`;
      }
      markdown += '\n';
      // Foreign Keys
      if (table.constraints.length > 0) {
        markdown += '### Foreign Keys\n\n| Constraint | Column | References |\n|------------|--------|------------|\n';
        for (const constraint of table.constraints) {
          markdown += `| ${constraint.constraint_name} | ${constraint.column_name} | ${constraint.foreign_table_name}(${constraint.foreign_column_name}) |\n`;
        }
        markdown += '\n';
      }
      // Indexes
      if (table.indexes.length > 0) {
        markdown += '### Indexes\n\n| Name | Definition |\n|------|------------|\n';
        for (const index of table.indexes) {
          markdown += `| ${index.indexname} | \`${index.indexdef}\` |\n`;
        }
        markdown += '\n';
      }
      markdown += '---\n\n';
    }
    // Write to file
    const docsDir = path.join(process.cwd(), 'docs');
    await fs.mkdir(docsDir, { recursive: true });
    const outputPath = path.join(docsDir, 'DATABASE.md');
    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`✅ Database documentation generated at ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating database documentation:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.end();
  }
}

// Run if executed directly
if (require.main === module) {
  generateDbDocs();
}
