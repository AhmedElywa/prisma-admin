'use client';

import Editor from '@monaco-editor/react';
import { AlertCircle, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JsonEditorProps {
  name: string;
  label: string;
  value?: any;
  defaultValue?: any;
  required?: boolean;
  schema?: Record<string, any>;
  height?: string;
}

export function JsonEditor({
  name,
  label,
  value,
  defaultValue = {},
  required = false,
  schema,
  height = '400px',
}: JsonEditorProps) {
  const initialValue = value || defaultValue;
  const initialJsonString =
    typeof initialValue === 'string'
      ? initialValue
      : JSON.stringify(initialValue, null, 2);

  const [jsonString, setJsonString] = useState(initialJsonString);
  const [_error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validJsonValue, setValidJsonValue] = useState(initialJsonString);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setError(null);
      setIsValid(true);
      setValidJsonValue(value);
    } catch (_e) {
      setError('Invalid JSON format');
      setIsValid(false);
    }
  };

  useEffect(() => {
    // Debounce validation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      validateJson(jsonString);
    }, 500); // Wait 500ms after user stops typing

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [jsonString]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonString(formatted);
      setValidJsonValue(formatted);
      setError(null);
      setIsValid(true);
    } catch (_e) {
      setError('Cannot format invalid JSON');
    }
  };

  const clearJson = () => {
    const emptyJson = '{}';
    setJsonString(emptyJson);
    setValidJsonValue(emptyJson);
    setError(null);
    setIsValid(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {jsonString === validJsonValue && isValid ? (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="mr-1 h-4 w-4" />
              Valid JSON
            </div>
          ) : isValid ? (
            <div className="flex items-center text-blue-600 text-sm">
              <Check className="mr-1 h-4 w-4" />
              Changes saved
            </div>
          ) : (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="mr-1 h-4 w-4" />
              Still editing...
            </div>
          )}
        </div>
      </div>

      <Tabs className="w-full" defaultValue="editor">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-2" value="editor">
          <Card className="overflow-hidden p-0">
            <Editor
              defaultLanguage="json"
              height={height}
              onChange={(value) => setJsonString(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
              theme="vs-dark"
              value={jsonString}
            />
          </Card>

          <div className="flex items-center gap-2">
            <Button
              onClick={formatJson}
              size="sm"
              type="button"
              variant="outline"
            >
              Format
            </Button>
            <Button
              onClick={clearJson}
              size="sm"
              type="button"
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-4">
            {isValid ? (
              <pre className="max-h-[400px] overflow-auto text-sm">
                <code>
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(jsonString), null, 2);
                    } catch {
                      return JSON.stringify(
                        JSON.parse(validJsonValue),
                        null,
                        2
                      );
                    }
                  })()}
                </code>
              </pre>
            ) : (
              <div>
                <div className="mb-2 flex items-center text-amber-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Still editing - showing last valid JSON
                </div>
                <pre className="max-h-[400px] overflow-auto text-sm opacity-60">
                  <code>
                    {(() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(validJsonValue),
                          null,
                          2
                        );
                      } catch {
                        return '{}';
                      }
                    })()}
                  </code>
                </pre>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <input name={name} type="hidden" value={validJsonValue} />
    </div>
  );
}
