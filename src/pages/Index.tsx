
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Heart, Clock, Calculator } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <img 
                src="/ACS.jpg" 
                alt="Acute Coronary Syndrome illustration" 
                className="mx-auto w-96 h-72 object-contain rounded-xl shadow-3xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Understanding Acute Coronary Syndrome
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              A Complete Guide to Your Heart Health
            </h2>
            <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto">
              Recognize the symptoms, understand the risks, and discover the right treatment steps to protect your heart.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/what-is-acs#symptoms">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Know the Emergency Symptoms
                </Button>
              </Link>
              <Link to="/screening">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                  <Calculator className="mr-2 h-5 w-5" />
                  Check Your Risk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">What is ACS?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 text-justify">
                  Acute Coronary Syndrome is an umbrella term for emergency conditions where blood flow to the heart is suddenly and severely reduced.
                </CardDescription>
                <Link to="/what-is-acs">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Types of ACS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 text-justify">
                  Learn about STEMI, NSTEMI, and Unstable Angina - the three main types of Acute Coronary Syndrome and their differences.
                </CardDescription>
                <Link to="/types-of-acs">
                  <Button variant="outline" className="w-full">
                    Explore Types
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Clock className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Fast Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 text-justify">
                  ACS is a medical emergency. Quick recognition and immediate treatment can save lives and prevent permanent heart damage.
                </CardDescription>
                <Link to="/diagnosis-treatment">
                  <Button variant="outline" className="w-full">
                    Treatment Options
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Heart Risk Calculator Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Check Your Heart Health Risk
          </h3>
          <p className="text-lg text-gray-700 mb-8">
            Take our interactive assessment to understand your cardiovascular risk factors and get personalized recommendations.
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Calculator className="mr-2 h-6 w-6 text-blue-600" />
                Heart Risk Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Answer a few simple questions about your health and lifestyle to get your risk assessment.
              </p>
              <Link to="/screening">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
