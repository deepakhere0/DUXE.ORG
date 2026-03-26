import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Square3Stack3DIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { AIService } from '../../services/aiService';
import FileUpload from './FileUpload';
import Toast from '../ui/Toast';


const ConceptMap = () => {
  // For now, we'll use anonymous user until auth is implemented
  const user = null;
  
  const [inputText, setInputText] = useState('');
  const [conceptData, setConceptData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleTextExtracted = (text) => {
    setInputText(text);
    setError(null);
  };

  const handleGenerateConceptMap = async () => {
    if (!inputText.trim()) {
      Toast.error('Please provide text to generate concept map');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await AIService.generateConceptMap({
        inputText,
        createdBy: user?.uid || 'anonymous'
      });
      setConceptData(result.output);
      
      // Convert to React Flow format
      const flowNodes = result.output.nodes.map(node => ({
        id: node.id,
        position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: { 
          label: node.label,
          description: node.description,
          importance: node.importance,
          type: node.type
        },
        style: getNodeStyle(node.type, node.importance),
        type: 'default'
      }));

      const flowEdges = result.output.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: edge.type === 'causes',
        style: getEdgeStyle(edge.type)
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      
      Toast.success('Concept map generated successfully!');
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getNodeStyle = (type, importance) => {
    const baseStyle = {
      padding: 10,
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 'bold',
      border: '2px solid',
      width: 150,
      textAlign: 'center'
    };

    const typeColors = {
      main: { background: '#1e40af', color: '#fff', borderColor: '#3b82f6' },
      subtopic: { background: '#047857', color: '#fff', borderColor: '#10b981' },
      detail: { background: '#7c3aed', color: '#fff', borderColor: '#a78bfa' }
    };

    const importanceScale = {
      high: 1.2,
      medium: 1,
      low: 0.9
    };

    const colors = typeColors[type] || typeColors.detail;
    const scale = importanceScale[importance] || 1;

    return {
      ...baseStyle,
      ...colors,
      transform: `scale(${scale})`
    };
  };

  const getEdgeStyle = (type) => {
    const styles = {
      relates: { stroke: '#94a3b8', strokeWidth: 2 },
      causes: { stroke: '#10b981', strokeWidth: 3 },
      contains: { stroke: '#3b82f6', strokeWidth: 2 },
      supports: { stroke: '#8b5cf6', strokeWidth: 2 },
      contrasts: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }
    };

    return styles[type] || styles.relates;
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodeClick = (event, node) => {
    setSelectedNode(node.data);
  };

  const downloadMap = async () => {
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      try {
        // Dynamic import to avoid module resolution issues
        const html2canvas = await import('html2canvas');
        const html2canvasFunc = html2canvas.default || html2canvas;
        
        const canvas = await html2canvasFunc(flowElement);
        const link = document.createElement('a');
        link.download = 'concept-map.png';
        link.href = canvas.toDataURL();
        link.click();
        Toast.success('Concept map downloaded as image!');
      } catch (err) {
        console.error('Failed to download map:', err);
        Toast.error('Download feature is currently unavailable. Please try again later.');
      }
    }
  };

  const downloadData = () => {
    if (conceptData) {
      const dataStr = JSON.stringify(conceptData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'concept-map-data.json';
      link.click();
      URL.revokeObjectURL(url);
      Toast.success('Concept map data downloaded!');
    }
  };

  return (
    <div className="concept-map">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Square3Stack3DIcon className="h-8 w-8 text-accent-500 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-white">AI Concept Mapping</h2>
            <p className="text-gray-400">Visualize concepts with intelligent mind maps</p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-8">
        <FileUpload 
          onTextExtracted={handleTextExtracted}
          className="mb-6"
        />
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-3">
          Or paste your study material:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-48 bg-slate-900/50 border border-accent-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          placeholder="Paste your text to create an interactive concept map..."
        />
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerateConceptMap}
          disabled={!inputText.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="spinner mr-2"></div>
              Generating Concept Map...
            </>
          ) : (
            <>
              <Square3Stack3DIcon className="h-5 w-5 mr-2" />
              Generate Concept Map
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-xl">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Concept Map Display */}
      {conceptData && (
        <>
          {/* Map Title and Info */}
          <div className="mb-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-6">
            <h3 className="text-2xl font-bold text-white mb-2">{conceptData.title}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>{conceptData.nodes?.length || 0} Concepts</span>
              <span>{conceptData.edges?.length || 0} Connections</span>
              <span>{conceptData.clusters?.length || 0} Groups</span>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-4 mb-6">
            <div style={{ height: '600px' }} className="react-flow-container">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background color="#334155" gap={16} />
                <MiniMap 
                  nodeColor={(node) => {
                    if (node.data.type === 'main') return '#1e40af';
                    if (node.data.type === 'subtopic') return '#047857';
                    return '#7c3aed';
                  }}
                  style={{
                    backgroundColor: '#1e293b',
                  }}
                />
                <Controls />
              </ReactFlow>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={downloadMap}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Export as Image
              </button>
              <button
                onClick={downloadData}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download Data
              </button>
            </div>
          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="bg-slate-800/50 border border-accent-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">{selectedNode.label}</h4>
              <p className="text-gray-300 mb-2">{selectedNode.description}</p>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedNode.importance === 'high' ? 'bg-red-500/20 text-red-400' :
                  selectedNode.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {selectedNode.importance} importance
                </span>
                <span className="px-2 py-1 rounded text-xs bg-accent-500/20 text-accent-400">
                  {selectedNode.type}
                </span>
              </div>
            </div>
          )}

          {/* Learning Path */}
          {conceptData.learningPath && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-6">
              <h4 className="text-xl font-bold text-white mb-4">Suggested Learning Path</h4>
              <div className="space-y-3">
                {conceptData.learningPath.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-accent-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{step.concept}</p>
                      <p className="text-gray-400 text-sm">{step.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Styles */}
      <style jsx>{`
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid #10b981;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .react-flow__node {
          font-size: 12px;
        }

        .react-flow__handle {
          width: 10px;
          height: 10px;
        }
      `}</style>
    </div>
  );
};

export default ConceptMap;
