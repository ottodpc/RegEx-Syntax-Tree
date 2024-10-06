import React from "react";
import { RegExTree } from "../services/regexParser";

interface SyntaxTreeVisualizerProps {
  tree: RegExTree;
}

const SyntaxTreeVisualizer: React.FC<SyntaxTreeVisualizerProps> = ({
  tree,
}) => {
  return (
    <div className="tree-node">
      {/* Render the root of the current subtree */}
      <div className="node-value">{treeToString(tree.root)}</div>
      {/* Recursively render children */}
      {tree.subTrees.length > 0 && (
        <div className="children">
          {tree.subTrees.map((subTree, index) => (
            <SyntaxTreeVisualizer key={index} tree={subTree} />
          ))}
        </div>
      )}
    </div>
  );
};

const treeToString = (root: number): string => {
  switch (root) {
    case 0xc04ca7:
      return "(.)";
    case 0xe7011e:
      return "(*)";
    case 0xa17e54:
      return "(|)";
    case 0xbaddad:
      return "Protection";
    case 0xd07:
      return "(.)";
    default:
      return String.fromCharCode(root);
  }
};

export default SyntaxTreeVisualizer;
