// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const OpenAI = require("openai-api");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pyd" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pyd.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from pyd!');
	});

	context.subscriptions.push(disposable);


	vscode.languages.registerHoverProvider('python', {
        async provideHover(document, position, token) {
			console.log("Inside the hover")
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
				
			const symbolsToFind = [vscode.SymbolKind.Function, vscode.SymbolKind.Method, vscode.SymbolKind.Constructor];

			const docSymbols = await vscode.commands.executeCommand(
				'vscode.executeDocumentSymbolProvider',
				vscode.window.activeTextEditor.document.uri
			) ;
		
			const docSymbolsFunctionsMethods = docSymbols
				? docSymbols.filter(symbol => symbolsToFind.includes(symbol.kind))
				: undefined;

			const docSymbolHovered = docSymbolsFunctionsMethods 
				? docSymbolsFunctionsMethods.filter(symbol => symbol.range.contains(position))
				: undefined;

            if (docSymbolHovered != undefined) {
				functionBody = document.getText(docSymbolHovered[0].range)

				if (!OPENAI_API_KEY) {
					await setApiKey();
				}
				const openai = new OpenAI(OPENAI_API_KEY);
			
				let editor = vscode.window.activeTextEditor;
				let selection = editor.selection;
				let activeCursor = editor.selection.active;
				let text = editor.document.getText(selection);
			
				prompt = `# Python 3 \n${functionBody} \n\n# Explanation of what the code does\n\n#`
				const response = await openai.complete({
				  engine: "code-davinci-002",
				  prompt: prompt,
				  temperature: 0,
				  max_tokens: 150,
				  top_p: 1.0,
				  frequency_penalty: 0.0,
				  presence_penalty: 0.0,
				});

				// const completion = await openai.complete({
				// 	engine: "davinci",
				// 	prompt: text,
				// 	maxTokens: 100,
				// });
			
				// editor.edit((editBuilder) => {
				// 	editBuilder.insert(activeCursor, completion.data.choices[0].text);
				// });

                return new vscode.Hover({
                    language: "Hello language",
                    value: "Silviu's bot thinks that: \n" + response.data.choices[0].text
                });
            }
        }
    });



	vscode.window.showInformationMessage(
		"OpenAI Codex Autocomplete has been Activated."
	  );
	
	  let OPENAI_API_KEY = context.workspaceState.get("@codex.key", "");
	
	  async function setApiKey() {
		let key = await vscode.window.showInputBox({
		  password: true,
		  title: "OpenAI API key",
		  prompt: "Enter API Key here...",
		});
		context.workspaceState.update("@codex.key", key);
		OPENAI_API_KEY = context.workspaceState.get("@codex.key", "");
		return true;
	  }
	
	  if (!OPENAI_API_KEY) {
		vscode.window.showInformationMessage(
		  "API Key Required to use OpenAI Codex"
		);
		setApiKey();
	  }
	
	  // SetToken Function
	  context.subscriptions.push(
		vscode.commands.registerCommand("openai-codex.setToken", async () => {
		  setApiKey();
		})
	  );
	
	  // AutoComplete Function
	//   context.subscriptions.push(
	// 	vscode.commands.registerCommand("openai-codex.autocomplete", async () => {
	// 	  // Get API Key from Globalstate
	// 	  if (!OPENAI_API_KEY) {
	// 		await setApiKey();
	// 	  }
	// 	  const openai = new OpenAI(OPENAI_API_KEY);
	
	// 	  let editor = vscode.window.activeTextEditor;
	// 	  let selection = editor.selection;
	// 	  let activeCursor = editor.selection.active;
	// 	  let text = editor.document.getText(selection);
	
	// 	  const completion = await openai.complete({
	// 		engine: "davinci",
	// 		prompt: text,
	// 		maxTokens: 100,
	// 	  });
	
	// 	  editor.edit((editBuilder) => {
	// 		editBuilder.insert(activeCursor, completion.data.choices[0].text);
	// 	  });
	// 	})
	//   );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
