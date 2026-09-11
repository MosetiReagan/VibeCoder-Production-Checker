import ts from 'typescript';
import type { SourceFile } from '../../shared.js';

export interface AstFinding {
  line: number;
  evidence: string;
}

const javascriptExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const sqlKeywords = /^(?:SELECT|INSERT|UPDATE|DELETE)\b/i;

export function isJavaScriptLike(file: SourceFile): boolean {
  return javascriptExtensions.has(file.extension);
}

export function findUnsafeSqlExecutions(file: SourceFile): AstFinding[] {
  const source = ts.createSourceFile(
    file.path,
    file.content,
    ts.ScriptTarget.Latest,
    true,
    file.extension === '.ts' || file.extension === '.tsx'
      ? ts.ScriptKind.TS
      : ts.ScriptKind.JS
  );
  const dynamicSqlVariables = new Map<string, ts.Expression>();
  const findings: AstFinding[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.name && node.initializer) {
      if (ts.isIdentifier(node.name) && isDynamicSql(node.initializer)) {
        dynamicSqlVariables.set(node.name.text, node.initializer);
      }
    }
    if (ts.isCallExpression(node) && isQueryCall(node) && node.arguments.length > 0) {
      const argument = node.arguments[0];
      const isDynamic =
        isDynamicSql(argument) ||
        (ts.isIdentifier(argument) && dynamicSqlVariables.has(argument.text));
      if (isDynamic) {
        const position = source.getLineAndCharacterOfPosition(node.getStart(source));
        findings.push({ line: position.line + 1, evidence: node.getText(source) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return findings;
}

function isQueryCall(node: ts.CallExpression): boolean {
  return /(?:query|execute|raw|all|get)$/.test(node.expression.getText());
}

function isDynamicSql(expression: ts.Expression): boolean {
  return isSqlString(expression) && containsDynamicValue(expression);
}

function isSqlString(expression: ts.Expression): boolean {
  if (ts.isStringLiteral(expression)) return sqlKeywords.test(expression.text);
  if (ts.isTemplateExpression(expression)) return sqlKeywords.test(expression.head.text);
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return isSqlString(expression.left);
  }
  return false;
}

function containsDynamicValue(expression: ts.Expression): boolean {
  if (
    ts.isIdentifier(expression) ||
    ts.isPropertyAccessExpression(expression) ||
    ts.isCallExpression(expression)
  ) {
    return true;
  }
  if (ts.isTemplateExpression(expression)) return expression.templateSpans.length > 0;
  if (ts.isBinaryExpression(expression)) {
    return containsDynamicValue(expression.left) || containsDynamicValue(expression.right);
  }
  return false;
}
