import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree"; // Utilisation de Tree pour afficher des arbres
import { RegExParser } from "../services/regexParser";
import {
  syntaxTreeToAutomaton,
  simulateNFA,
} from "../services/automatonSimulator";
import { minimizeDFA } from "../services/minimisation";
import "./RegexTester.css";

const RegexTester: React.FC = () => {
  const [regex, setRegex] = useState("S[a-z]+on");
  const [syntaxTree, setSyntaxTree] = useState<any | null>(null);
  const [treeData, setTreeData] = useState<any | null>(null); // Tree data for visualization
  const [lines, setLines] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[]>([]);

  const handleParse = () => {
    try {
      const parsedTree = RegExParser.parseRegEx(regex);
      setSyntaxTree(parsedTree);

      // Convertir l'arbre de syntaxe en un format utilisable pour Tree
      const convertToTreeData = (node: any) => {
        if (!node.subTrees || node.subTrees.length === 0) {
          return { name: String.fromCharCode(node.root) }; // Affichage des nœuds sous forme de caractères
        }
        return {
          name: String.fromCharCode(node.root),
          children: node.subTrees.map((child: any) => convertToTreeData(child)),
        };
      };

      const treeFormat = convertToTreeData(parsedTree);
      setTreeData(treeFormat); // Définir les données de l'arbre pour Tree

      // Générer l'automate et tester les lignes du fichier
      const automaton = syntaxTreeToAutomaton(parsedTree);

      // Minimiser l'automate après sa génération
      const minimizedAutomaton = minimizeDFA(automaton);

      const results = lines.map((line) =>
        simulateNFA(minimizedAutomaton, line)
      );
      setResults(results);
    } catch (error) {
      console.error("Error parsing regex:", error);
    }
  };

  // Charger le fichier texte et diviser en lignes
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const fileName = "56667-0.txt"; // Nom du fichier dans le dossier public
        const response = await fetch(`/${fileName}`);
        const text = await response.text();
        const fileLines = text.split("\n"); // Diviser le fichier en lignes
        setLines(fileLines); // Enregistrer les lignes dans l'état
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    };

    fetchFile();
  }, []);

  return (
    <div className="regex-tester">
      <h1>RegEx Syntax Tree Tester</h1>
      <p className="text-gray-500">Test with "S(a|g|r)+on" or "S[a-z]+on"</p>
      <div>
        <label htmlFor="regexInput">Enter a RegEx:</label>
        <input
          id="regexInput"
          type="text"
          value={regex}
          onChange={(e) => setRegex(e.target.value)}
          placeholder="Enter regular expression"
        />
        <button
          className="p-2 text-white bg-black rounded hover:bg-green-500"
          onClick={handleParse}
        >
          Parse
        </button>
      </div>

      <div className="syntax-tree">
        <h2>Syntax Tree:</h2>
        {treeData ? (
          <div style={{ width: "100%", height: "500px" }}>
            <Tree data={treeData} orientation="vertical" />{" "}
            {/* Affichage de l'arbre */}
          </div>
        ) : (
          <p>No syntax tree available.</p>
        )}
      </div>

      <div className="file-results">
        <h2>Matching Results:</h2>
        {results.length > 0 ? (
          <ul>
            {lines.map((line, index) => (
              <li key={index}>
                Line {index + 1}:{" "}
                {results[index] ? "Matches" : "Does not match"} - {line}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results yet. Enter a regex to test.</p>
        )}
      </div>
    </div>
  );
};

export default RegexTester;
