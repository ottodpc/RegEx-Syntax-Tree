import React, { useState, useEffect, useMemo } from "react";
import Tree from "react-d3-tree";
import { RegExParser } from "../services/regexParser";
import {
  buildAutomatonFromTree,
  simulateNFA,
} from "../services/automatonSimulator";
import { nfaToDfa } from "../services/determinization";
import { minimizeDFA } from "../services/minimisation";
import "./RegexTester.css";

// Constantes pour les opérateurs / Operator constants
const CONCAT = 0xc04ca7;
const ETOILE = 0xe7011e;
const ALTERN = 0xa17e54;
const DOT = 0xd07;

// Fonction d'aide pour obtenir des noms lisibles / Helper function for readable names
const getNodeName = (root: number): string => {
  if (root === CONCAT) return "·";
  if (root === ETOILE) return "*";
  if (root === ALTERN) return "|";
  if (root === DOT) return ".";
  return String.fromCharCode(root);
};

const RegexTester: React.FC = () => {
  const [regex, setRegex] = useState("S[a-z]+on");
  const [treeData, setTreeData] = useState<any | null>(null); // Tree data for visualization
  const [lines, setLines] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      const parsedTree = RegExParser.parseRegEx(regex);

      // Convertir l'arbre en format react-d3-tree / Convert tree to react-d3-tree format
      const convertToTreeData = (node: any): any => {
        const nodeName = getNodeName(node.root);

        if (!node.subTrees || node.subTrees.length === 0) {
          return {
            name: nodeName,
            attributes: { type: "leaf" }
          };
        }

        return {
          name: nodeName,
          attributes: { type: "operator" },
          children: node.subTrees.map((child: any) => convertToTreeData(child)),
        };
      };

      const treeFormat = convertToTreeData(parsedTree);
      setTreeData(treeFormat);

      // Correct pipeline: NFA → DFA → Minimal DFA (Aho-Ullman methodology)
      // Question 2.2: Construct epsilon-NFA from syntax tree
      const nfa = buildAutomatonFromTree(parsedTree);

      // Question 2.3: Determinize the NFA (subset construction)
      const dfa = nfaToDfa(nfa);

      // Question 2.4: Minimize the DFA
      const minimalDfa = minimizeDFA(dfa);

      // Process in chunks to prevent UI blocking
      const chunkSize = 100;
      const newResults: boolean[] = [];

      for (let i = 0; i < lines.length; i += chunkSize) {
        const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length));

        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));

        const chunkResults = chunk.map((line) => {
          // Try matching at each position in the line
          for (let start = 0; start < line.length; start++) {
            for (let end = start + 1; end <= line.length; end++) {
              const substring = line.substring(start, end);
              if (simulateNFA(minimalDfa, substring)) {
                return true;
              }
            }
          }
          return false;
        });

        newResults.push(...chunkResults);
      }

      setResults(newResults);
    } catch (error: any) {
      console.error("Error parsing regex:", error);
      setError(error.message || "Erreur lors de l'analyse de la regex");
    } finally {
      setIsProcessing(false);
    }
  };

  // Charger le fichier texte et diviser en lignes
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const fileName = "56667-0.txt"; // Nom du fichier dans le dossier public
        const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
        const text = await response.text();
        const fileLines = text.split("\n"); // Diviser le fichier en lignes
        setLines(fileLines); // Enregistrer les lignes dans l'état
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    };

    fetchFile();
  }, []);

  // Configuration de l'arbre avec centrage / Tree configuration with centering
  const treeConfig = useMemo(() => ({
    translate: { x: 400, y: 50 },
    pathFunc: "step",
    orientation: "vertical",
    nodeSize: { x: 200, y: 100 },
    separation: { siblings: 1.5, nonSiblings: 2 },
  }), []);

  // Style personnalisé pour les nœuds / Custom node styling
  const renderCustomNode = ({ nodeDatum }: any) => (
    <g>
      <circle r={20} fill="#4A90E2" stroke="#2C3E50" strokeWidth="2" />
      <text
        fill="white"
        strokeWidth="0"
        x="0"
        y="5"
        textAnchor="middle"
        style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "monospace" }}
      >
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes?.type === "leaf" && (
        <circle r="3" cx="0" cy="-25" fill="#27AE60" />
      )}
    </g>
  );

  return (
    <div className="regex-tester">
      <h1>Testeur d'Arbre Syntaxique RegEx</h1>
      <p className="subtitle">
        Testez avec : <code>"S(a|g|r)+on"</code> ou <code>"S[a-z]+on"</code>
      </p>

      <div className="input-section">
        <label htmlFor="regexInput">
          Expression Régulière :
        </label>
        <div className="input-group">
          <input
            id="regexInput"
            type="text"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            placeholder="Entrez une expression régulière"
          />
          <button
            className="parse-button"
            onClick={handleParse}
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement...' : 'Analyser'}
          </button>
        </div>
        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
            ⚠️ Erreur: {error}
          </div>
        )}
      </div>

      <div className="syntax-tree">
        <h2>Arbre Syntaxique</h2>
        {treeData ? (
          <div className="tree-container">
            <Tree
              data={treeData}
              translate={treeConfig.translate}
              pathFunc={treeConfig.pathFunc as any}
              orientation={treeConfig.orientation as any}
              nodeSize={treeConfig.nodeSize}
              separation={treeConfig.separation}
              renderCustomNodeElement={renderCustomNode}
              zoom={0.8}
              enableLegacyTransitions
            />
          </div>
        ) : (
          <p className="no-data">
            Aucun arbre syntaxique disponible. Entrez une RegEx et cliquez sur "Analyser".
          </p>
        )}
      </div>

      <div className="file-results">
        <h2>Résultats de Correspondance</h2>
        {isProcessing ? (
          <div className="processing" style={{ textAlign: 'center', padding: '20px' }}>
            <p>⏳ Analyse en cours... Cela peut prendre quelques secondes pour un fichier volumineux.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="results-summary">
            <p>
              <strong>{results.filter(r => r).length}</strong> correspondances trouvées sur{" "}
              <strong>{lines.length}</strong> lignes
            </p>
            <ul>
              {lines.map((line, index) => {
                // Only show first 50 matches to prevent UI freezing
                const matchCount = results.slice(0, index + 1).filter(r => r).length;
                if (results[index] && matchCount <= 50) {
                  return (
                    <li key={index} className="match">
                      <span className="line-num">Ligne {index + 1}:</span>
                      <span className="line-content">
                        {line.length > 100 ? line.substring(0, 100) + '...' : line}
                      </span>
                    </li>
                  );
                }
                return null;
              })}
              {results.filter(r => r).length > 50 && (
                <li className="more-results">
                  ... et {results.filter(r => r).length - 50} autres correspondances
                </li>
              )}
            </ul>
          </div>
        ) : (
          <p className="no-data">
            Aucun résultat. Entrez une regex pour tester.
          </p>
        )}
      </div>
    </div>
  );
};

export default RegexTester;
