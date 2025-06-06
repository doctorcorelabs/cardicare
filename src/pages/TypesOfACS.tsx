
import { AlertTriangle, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TypesOfACS = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Understanding the Types of Acute Coronary Syndrome
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about the three main types of ACS and their key differences
          </p>
        </div>

        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-medium text-justify">
            <strong>Important:</strong> All types of ACS are medical emergencies requiring immediate attention. The type is determined by doctors through tests like ECG and blood work.
          </AlertDescription>
        </Alert>

        {/* STEMI Section */}
        <section className="mb-12">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center text-2xl text-red-800">
                <AlertTriangle className="mr-3 h-8 w-8" />
                STEMI (ST-Segment Elevation Myocardial Infarction)
              </CardTitle>
              <CardDescription className="text-red-700 font-medium text-justify">
                The most serious type of heart attack - Complete artery blockage
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">What Happens:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• A coronary artery is completely blocked</li>
                    <li>• Blood flow to part of the heart muscle stops entirely</li>
                    <li>• Heart muscle begins to die without immediate treatment</li>
                    <li>• Shows specific changes on an ECG (ST-segment elevation)</li>
                  </ul>
                  
                  <h4 className="font-semibold text-lg mt-6 mb-3">Treatment Urgency:</h4>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-red-800 font-medium text-justify">
                      <Clock className="inline mr-2 h-4 w-4" />
                      <strong>Time is critical!</strong> Treatment should begin within 90 minutes for best outcomes.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3">Typical Symptoms:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Severe, crushing chest pain</li>
                    <li>• Pain radiating to arm, neck, or jaw</li>
                    <li>• Profuse sweating</li>
                    <li>• Shortness of breath</li>
                    <li>• Nausea and vomiting</li>
                  </ul>
                  
                  <h4 className="font-semibold text-lg mt-6 mb-3">Immediate Treatment:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Emergency angioplasty (balloon and stent)</li>
                    <li>• Clot-busting medications if angioplasty unavailable</li>
                    <li>• Medications to prevent further clotting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* NSTEMI Section */}
        <section className="mb-12">
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center text-2xl text-orange-800">
                <Activity className="mr-3 h-8 w-8" />
                NSTEMI (Non-ST-Segment Elevation Myocardial Infarction)
              </CardTitle>
              <CardDescription className="text-orange-700 font-medium text-justify">
                Partial artery blockage with heart muscle damage
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">What Happens:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• A coronary artery is partially blocked</li>
                    <li>• Some blood flow continues, but it's severely reduced</li>
                    <li>• Heart muscle damage has already occurred</li>
                    <li>• Blood tests show elevated cardiac enzymes</li>
                    <li>• ECG may show changes but not ST-elevation</li>
                  </ul>
                  
                  <h4 className="font-semibold text-lg mt-6 mb-3">Severity:</h4>
                  <div className="bg-orange-100 p-4 rounded-lg">
                    <p className="text-orange-800 text-justify">
                      Less immediately life-threatening than STEMI, but still requires urgent treatment within 24-72 hours.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3">Typical Symptoms:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Chest pain (may be less severe than STEMI)</li>
                    <li>• Pain may come and go</li>
                    <li>• Shortness of breath</li>
                    <li>• Fatigue</li>
                    <li>• Sweating (may be less profuse)</li>
                  </ul>
                  
                  <h4 className="font-semibold text-lg mt-6 mb-3">Treatment Approach:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Medications to stabilize the condition</li>
                    <li>• Angiography within 24-72 hours</li>
                    <li>• Angioplasty if significant blockage found</li>
                    <li>• Blood thinners and heart medications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Unstable Angina Section */}
        <section className="mb-12">
          <Card className="border-yellow-200">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center text-2xl text-yellow-800">
                <AlertTriangle className="mr-3 h-8 w-8" />
                Unstable Angina
              </CardTitle>
              <CardDescription className="text-yellow-700 font-medium text-justify">
                A serious warning sign - Heart attack could happen at any moment
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">What Happens:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Plaque has become unstable but hasn't completely blocked the artery</li>
                    <li>• Blood flow is severely disrupted</li>
                    <li>• No permanent heart muscle damage yet</li>
                    <li>• Cardiac enzyme blood tests are normal</li>
                    <li>• High risk of progressing to a heart attack</li>
                  </ul>
                  
                  <h4 className="font-semibold text-lg mt-6 mb-3">Warning Signs:</h4>
                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <p className="text-yellow-800 font-medium text-justify">
                      <AlertTriangle className="inline mr-2 h-4 w-4" />
                      This is a serious warning sign that a heart attack could occur at any moment.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3">Typical Symptoms:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Chest pain at rest or with minimal activity</li>
                    <li>• Pain pattern that's new or different</li>
                    <li>• Pain that lasts longer than usual</li>
                    <li>• Pain not relieved by rest or nitroglycerin</li>
                    <li>• May have periods without symptoms</li>
                  </ul>
                  
                  <h4 className="font-semibold text-lg mt-6 mb-3">Immediate Actions:</h4>
                  <ul className="space-y-2 text-gray-700 text-justify">
                    <li>• Hospitalization for monitoring</li>
                    <li>• Medications to prevent clot formation</li>
                    <li>• Angiography to assess blockages</li>
                    <li>• Treatment to prevent progression to heart attack</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Comparison Summary */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Quick Comparison</CardTitle>
              <CardDescription>
                Understanding the key differences between ACS types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Characteristic</th>
                      <th className="text-left p-3 font-semibold text-red-600">STEMI</th>
                      <th className="text-left p-3 font-semibold text-orange-600">NSTEMI</th>
                      <th className="text-left p-3 font-semibold text-yellow-600">Unstable Angina</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="p-3 font-medium">Artery Blockage</td>
                      <td className="p-3">Complete</td>
                      <td className="p-3">Partial</td>
                      <td className="p-3">Severe narrowing</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Heart Damage</td>
                      <td className="p-3">Immediate and severe</td>
                      <td className="p-3">Already occurred</td>
                      <td className="p-3">None yet</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">ECG Changes</td>
                      <td className="p-3">ST-elevation</td>
                      <td className="p-3">Other changes</td>
                      <td className="p-3">May be normal</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Blood Enzymes</td>
                      <td className="p-3">Elevated</td>
                      <td className="p-3">Elevated</td>
                      <td className="p-3">Normal</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Treatment Urgency</td>
                      <td className="p-3">Within 90 minutes</td>
                      <td className="p-3">Within 24-72 hours</td>
                      <td className="p-3">Immediate monitoring</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Remember Section */}
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-justify">
            <strong>Remember:</strong> You don't need to diagnose the type of ACS yourself. If you experience any symptoms that could be ACS, seek emergency medical care immediately. Healthcare professionals will determine the specific type and appropriate treatment.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default TypesOfACS;
