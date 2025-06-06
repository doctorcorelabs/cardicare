
import { Heart, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert className="mb-6 border-red-200 bg-red-50">
          <Phone className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-medium text-justify">
            <strong>Emergency Warning:</strong> The information on this site is for educational purposes only and cannot replace professional medical advice. If you or someone you know is experiencing symptoms of a heart attack, immediately call your local emergency services (112, 118, or 119).
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">CardiCare</span>
          </div>
          
          <div className="text-center md:text-right text-sm text-gray-600">
            <p>© 2025 CardiCare. Educational and Informational content only.</p>
            <p className="mt-1">Always consult healthcare professionals for medical advice.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
