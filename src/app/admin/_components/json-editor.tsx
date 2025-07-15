'use client'

import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { AlertCircle, Check } from 'lucide-react'

interface JsonEditorProps {
  name: string
  label: string
  value?: any
  defaultValue?: any
  required?: boolean
  schema?: Record<string, any>
  height?: string
}

export function JsonEditor({ 
  name, 
  label, 
  value, 
  defaultValue = {}, 
  required = false,
  schema,
  height = '400px'
}: JsonEditorProps) {
  const initialValue = value || defaultValue
  const initialJsonString = typeof initialValue === 'string' 
    ? initialValue 
    : JSON.stringify(initialValue, null, 2)
  
  const [jsonString, setJsonString] = useState(initialJsonString)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [validJsonValue, setValidJsonValue] = useState(initialJsonString)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Debounce validation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      validateJson(jsonString)
    }, 500) // Wait 500ms after user stops typing

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [jsonString])

  const validateJson = (value: string) => {
    try {
      JSON.parse(value)
      setError(null)
      setIsValid(true)
      setValidJsonValue(value)
    } catch (e) {
      setError('Invalid JSON format')
      setIsValid(false)
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonString)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonString(formatted)
      setValidJsonValue(formatted)
      setError(null)
      setIsValid(true)
    } catch (e) {
      setError('Cannot format invalid JSON')
    }
  }

  const clearJson = () => {
    const emptyJson = '{}'
    setJsonString(emptyJson)
    setValidJsonValue(emptyJson)
    setError(null)
    setIsValid(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {jsonString === validJsonValue && isValid ? (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              Valid JSON
            </div>
          ) : isValid ? (
            <div className="flex items-center text-blue-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              Changes saved
            </div>
          ) : (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Still editing...
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-2">
          <Card className="p-0 overflow-hidden">
            <Editor
              height={height}
              defaultLanguage="json"
              value={jsonString}
              onChange={(value) => setJsonString(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </Card>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={formatJson}
            >
              Format
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearJson}
            >
              Clear
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card className="p-4">
            {isValid ? (
              <pre className="text-sm overflow-auto max-h-[400px]">
                <code>
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(jsonString), null, 2)
                    } catch {
                      return JSON.stringify(JSON.parse(validJsonValue), null, 2)
                    }
                  })()}
                </code>
              </pre>
            ) : (
              <div>
                <div className="text-amber-600 flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Still editing - showing last valid JSON
                </div>
                <pre className="text-sm overflow-auto max-h-[400px] opacity-60">
                  <code>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(validJsonValue), null, 2)
                      } catch {
                        return '{}'
                      }
                    })()}
                  </code>
                </pre>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <input
        type="hidden"
        name={name}
        value={validJsonValue}
      />
    </div>
  )
}