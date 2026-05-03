import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Maximize2, ZoomIn, MousePointer2 } from 'lucide-react';
import ReactDOM from 'react-dom';

interface XYFlowRendererProps {
  nodes: Node[];
  edges: Edge[];
}

const XYFlowRenderer: React.FC<XYFlowRendererProps> = ({ nodes: initialNodes, edges: initialEdges }) => {
  // Simple layout logic: if x/y are 0 or missing, stack them vertically
  const positionedNodes = useMemo(() => {
    return initialNodes.map((node, index) => ({
      ...node,
      position: node.position || { x: 250, y: index * 120 + 50 },
      style: {
        background: '#fff',
        color: '#1e293b',
        border: '2px solid #0ea5e9',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        padding: '10px',
        width: 150,
        textAlign: 'center' as const,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        ...node.style
      }
    }));
  }, [initialNodes]);

  const [nodes, setNodes] = useState<Node[]>(positionedNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <div className="h-[200px] w-full bg-slate-50/80 rounded-xl border border-teal-100/40 overflow-hidden shadow-inner group-hover:border-teal-300/50 transition-all">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
          >
            <Background color="#f1f5f9" gap={16} />
          </ReactFlow>
        </div>
        <div className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={14} className="text-teal-600" />
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <MousePointer2 size={10} />
          Click to interact
        </div>
      </div>

      {/* Modal Overlay via Portal */}
      {isModalOpen && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-12 animate-in fade-in duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in slide-in-from-bottom-8 duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/80">
              <div className="flex flex-col">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                  <Maximize2 size={22} className="text-teal-500" />
                  Interactive Flow Explorer
                </h3>
                <p className="text-xs text-slate-400 font-medium ml-8">
                  Click and drag to move steps around
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-200/60 rounded-2xl transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-slate-900"
              >
                <X size={28} />
              </button>
            </div>

            {/* Flow Content */}
            <div className="flex-1 bg-white relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Background color="#f8fafc" gap={20} />
                <Controls />
                <Panel position="top-right" className="bg-white/90 p-3 rounded-xl border border-slate-200 shadow-sm text-xs font-medium text-slate-500">
                  Interactive Mode Active
                </Panel>
              </ReactFlow>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ZoomIn size={14} />
                You can zoom, pan, and drag nodes to better understand the flow
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default XYFlowRenderer;
