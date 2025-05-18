import React, { useState } from 'react';
import { Play, Download, Upload, Save, Copy, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SqlEditor: React.FC = () => {
  const [sql, setSql] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedQueries, setSavedQueries] = useState<{ name: string; sql: string }[]>([]);

  const executeQuery = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error } = await supabase.rpc('execute_sql', { query: sql });
      
      if (error) throw error;
      
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuery = () => {
    const name = prompt('Enter a name for this query:');
    if (name) {
      setSavedQueries([...savedQueries, { name, sql }]);
    }
  };

  const loadQuery = (savedSql: string) => {
    setSql(savedSql);
  };

  const deleteQuery = (index: number) => {
    const newQueries = [...savedQueries];
    newQueries.splice(index, 1);
    setSavedQueries(newQueries);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
  };

  const downloadResults = () => {
    if (!results) return;

    const csv = results.map(row => 
      Object.values(row).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">SQL Editor</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Copy SQL"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={saveQuery}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Save Query"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="w-full h-64 font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your SQL query here..."
              />
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={executeQuery}
                  disabled={!sql.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  Execute Query
                </button>

                {results && (
                  <button
                    onClick={downloadResults}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Results
                  </button>
                )}
              </div>
            </div>

            {savedQueries.length > 0 && (
              <div className="w-64 border-l pl-4">
                <h3 className="font-medium mb-2">Saved Queries</h3>
                <div className="space-y-2">
                  {savedQueries.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <button
                        onClick={() => loadQuery(query.sql)}
                        className="text-left text-sm text-blue-600 hover:text-blue-800"
                      >
                        {query.name}
                      </button>
                      <button
                        onClick={() => deleteQuery(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-mono text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium">Query Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((value: any, j) => (
                        <td
                          key={j}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {value === null ? (
                            <span className="text-gray-400 italic">null</span>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlEditor;