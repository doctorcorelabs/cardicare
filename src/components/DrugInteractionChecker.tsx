// src/components/DrugInteractionChecker.tsx
// This component uses a simplified CORS-friendly worker at port 8789 for drug interactions
// The original worker (port 8787) was having CORS issues that were resolved with this approach
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, PlusCircle, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DrugInput {
  id: string;
  name: string;
}

interface InteractionResultItem {
  pair: string[];
  severity: string;
  description: string;
}

interface ApiResponse {
  interactions?: InteractionResultItem[];
  error?: string;
}

// Configure worker URL for drug interaction API
const WORKER_URL = 'https://drug-interaction-worker.cardicare.daivanlabs.site'; // Production worker URL

const DrugInteractionChecker: React.FC = () => {
  const [drugInputs, setDrugInputs] = useState<DrugInput[]>([
    { id: `drug-${Date.now()}-1`, name: '' },
    { id: `drug-${Date.now()}-2`, name: '' },
  ]);
  const [results, setResults] = useState<InteractionResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (id: string, value: string) => {
    setDrugInputs(inputs =>
      inputs.map(input => (input.id === id ? { ...input, name: value } : input))
    );
    // Clear previous results/errors when input changes
    setResults(null);
    setError(null);
  };

  const addDrugInput = () => {
    if (drugInputs.length < 10) { // Limit to 10 drugs for now
      setDrugInputs(inputs => [
        ...inputs,
        { id: `drug-${Date.now()}-${inputs.length + 1}`, name: '' },
      ]);
    }
  };

  const removeDrugInput = (id: string) => {
    if (drugInputs.length > 2) { // Keep at least 2 inputs
      setDrugInputs(inputs => inputs.filter(input => input.id !== id));
    }
  };  const handleSubmit = useCallback(async () => {
    const drugNames = drugInputs
      .map(input => input.name.trim())
      .filter(name => name.length > 0);

    if (drugNames.length < 2) {
      setError('Please enter at least two drug names to check for interactions.');
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log(`Sending request to worker at ${WORKER_URL} for drugs:`, drugNames);
      
      // Using mode: 'cors' explicitly to help with CORS issues
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ drugs: drugNames }),
      });

      console.log(`Received response with status: ${response.status}`);
      
      // Handle network errors
      if (!response) {
        throw new Error('Network error: No response received from the server');
      }
      
      const data: ApiResponse = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (data.error) {
        setError(data.error);
      } else if (data.interactions) {
        setResults(data.interactions);
        if (data.interactions.length === 0) {
          // No interactions found is handled in the UI
        }
      } else {
        setError('Invalid response format from the server');
      }
    } catch (err) {
      console.error('Interaction check error:', err);
      
      // Provide more helpful error message for connection issues
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(`Cannot connect to the drug interaction service at ${WORKER_URL}. Make sure the worker is running. (CORS error possible)`);
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        setError('The connection was aborted. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [drugInputs]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Drug Interaction Checker</CardTitle>
        <CardDescription>
          Enter two or more drug names to check for potential interactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {drugInputs.map((input, index) => (
            <div key={input.id} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder={`Drug ${index + 1}`}
                value={input.name}
                onChange={e => handleInputChange(input.id, e.target.value)}
                className="flex-grow"
              />
              {drugInputs.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDrugInput(input.id)}
                  aria-label="Remove drug"
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          {drugInputs.length < 10 && (
            <Button variant="outline" onClick={addDrugInput} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Drug
            </Button>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} className="w-full text-lg py-3">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            'Check Interactions'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && !error && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Interaction Results:</h3>
            {results.length === 0 ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">No Interactions Found</AlertTitle>
                <AlertDescription className="text-green-700">
                  No potential interactions were found among the specified drugs based on the available data.
                </AlertDescription>
              </Alert>
            ) : (
              <ul className="space-y-4">
                {results.map((result, index) => (
                  <li key={index} className="p-4 border rounded-md shadow-sm bg-white">
                    <p className="font-semibold text-md text-blue-700">
                      Interaction between: {result.pair.join(' and ')}
                    </p>
                    {result.severity !== 'Unknown' && (
                       <p className="text-sm text-gray-600">
                         <span className="font-medium">Severity:</span> {result.severity}
                       </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Description:</span> {result.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DrugInteractionChecker;
