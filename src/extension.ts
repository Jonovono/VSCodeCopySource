import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.copySourceCode",
    async (fileUri: vscode.Uri) => {
      if (fileUri) {
        const isDirectory = fs.lstatSync(fileUri.fsPath).isDirectory();
        if (isDirectory) {
          const allSourceCode = await readDirectoryRecursive(fileUri.fsPath);
          vscode.env.clipboard.writeText(allSourceCode);
          vscode.window.showInformationMessage(
            "All source code from directory copied to clipboard."
          );
        } else {
          const fileContent = fs.readFileSync(fileUri.fsPath, "utf-8");
          const fileHeader = `/* File: ${fileUri.fsPath} */\n\n`;
          vscode.env.clipboard.writeText(fileHeader + fileContent);
          vscode.window.showInformationMessage(
            "Source code from file copied to clipboard."
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function readDirectoryRecursive(dir: string): Promise<string> {
  let allSourceCode = "";
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      allSourceCode += await readDirectoryRecursive(filePath);
    } else {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const fileHeader = `/* File: ${filePath} */\n\n`;
      allSourceCode += fileHeader + fileContent + "\n";
    }
  }
  return allSourceCode;
}

export function deactivate() {}
