
interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({ title, message, onConfirm, onCancel }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-700 my-2">{message}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-xl">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#FF4F81] text-white rounded-xl">Yes</button>
        </div>
      </div>
    </div>
  );
}
