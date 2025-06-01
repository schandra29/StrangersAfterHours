import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStartGame: () => void;
}

export default function WelcomeScreen({ onStartGame }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="card bg-card/90 rounded-3xl p-8 mb-8 border border-primary/20 shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <img 
            src="/images/thumbnail.jpg" 
            alt="Friends socializing at a party" 
            className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-4 border-secondary" 
          />
          <h1 className="font-heading font-bold text-4xl text-white mb-2">
            Strangers<span className="text-secondary">:</span> <span className="text-primary">After Hours</span>
          </h1>
          <p className="text-lg text-gray-300">A party game for building connections</p>
        </div>

        <div className="mb-8">
          <p className="mb-6 text-gray-300 text-center">
            Gather your friends and get ready for meaningful conversations ranging from lighthearted to deep and revealing.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <i className="ri-group-line text-xl text-white"></i>
              </div>
              <p className="text-xs text-gray-300">Gather friends</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <i className="ri-chat-3-line text-xl text-white"></i>
              </div>
              <p className="text-xs text-gray-300">Answer prompts</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <i className="ri-heart-line text-xl text-white"></i>
              </div>
              <p className="text-xs text-gray-300">Build connections</p>
            </div>
          </div>
        </div>

        <Button 
          className="btn-primary w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center mb-4"
          onClick={onStartGame}
        >
          <i className="ri-play-circle-line mr-2 text-xl"></i> Start Game
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Perfect for parties, dates, or friend gatherings
          </p>
        </div>
      </div>
    </div>
  );
}