import { Plugin, App, Modal, MarkdownView, Notice, Editor, TFile, TAbstractFile, requestUrl } from 'obsidian';

interface PaperlessNgxSettings {
  apiUrl: string;
  dummyFolder: string;
}

const DEFAULT_SETTINGS: PaperlessNgxSettings = {
  apiUrl: 'http://192.168.1.100:1280/api',
  dummyFolder: 'Anhänge/paperless-ngx'
};

export default class PaperlessNgxPlugin extends Plugin {
  settings: PaperlessNgxSettings;

  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: 'render-paperless-ngx-document',
      name: 'Render Paperless-ngx Document',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const documentId = this.getDocumentIdFromEditor(editor);
        if (documentId) {
          this.renderDocument(documentId, editor);
        } else {
          new Notice('Please provide a valid document ID.');
        }
      },
    });
    this.addCommand({
      id: 'insert-paperless-ngx-document',
      name: 'Insert Paperless-ngx Document by ID',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        await this.promptDocumentId(editor);
      },
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // tbd
  async promptDocumentId(editor: Editor) {
    const modal = new AddNumberModal(this.app, this, editor);
    modal.open();
  }

  getDocumentIdFromEditor(editor: Editor): string | null {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const match = line.match(/paperless-ngx\s+(\d+)/);
    return match ? match[1] : null;
  }

  async renderDocument(documentId: string, editor: Editor) {
    try {
      const fileName = await this.addDocument(documentId);
      if (fileName !== null) {
        this.replaceLine(editor, fileName);
      }
    } catch (error) {
      console.error('Error rendering Paperless-ngx document:', error);
      new Notice('Failed to render Paperless-ngx document. Check the console for more details.');
    }
  }

  async insertDocument(documentId: string, editor: Editor) {
    try {
      const fileName = await this.addDocument(documentId);
      if (fileName !== null) {
        this.insertLine(editor, fileName);
      }
    } catch (error) {
      console.error('Error insert Paperless-ngx document:', error);
      new Notice('Failed to insert Paperless-ngx document. Check the console for more details.');
    }
  }

  async addDocument(documentId: string): Promise<string | null> {
    try {
      const responseMetadata = await this.requestMetadata(documentId);
      const fileName = responseMetadata.json["media_filename"];
      const text = `${this.settings.apiUrl}/documents/${documentId}/preview/`;
      const filePath = `${this.settings.dummyFolder}/${fileName}`;
      let file: TFile | null = await this.app.vault.getFileByPath(filePath);

      if (file !== null) {
        await this.modifyFile(file, text);
      } else {
        file = await this.createFile(filePath, text);
      }
      return fileName

    } catch (error) {
      console.error('Error adding document:', error);
      new Notice('Failed to add document. Check the console for more details.');
      return null;
    }
  }

  async requestMetadata(documentId: string) {
    return requestUrl({
      url: `${this.settings.apiUrl}/documents/${documentId}/metadata/`,
      method: 'GET',
    });
  }

  async createFile(filePath: string, text: string): Promise<TFile> {
    return this.app.vault.create(filePath, text);
  }

  async modifyFile(file: TFile, text: string) {
    await this.app.vault.modify(file, text);
  }

  replaceLine(editor: Editor, fileName: string) {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const match = line.match(/paperless-ngx\s+(\d+)/);
    if (match) {
      const newLine = line.replace(match[0], `![[${fileName}]]`);
      editor.replaceRange(newLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
    } else {
      new Notice('Failed to find source string in editor.');
    }
  }

  insertLine(editor: Editor, fileName: string) {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    editor.replaceRange(`![[${fileName}]]`, cursor);
  }
}

class AddNumberModal extends Modal {
  plugin: PaperlessNgxPlugin;
  editor: Editor;
  constructor(app: App, plugin: PaperlessNgxPlugin, editor: Editor) {
    super(app);
    this.plugin = plugin;
    this.editor = editor;
  }

  onOpen() {
      const { contentEl } = this;
      contentEl.createEl('h2', { text: 'Enter DocumentId' });
      const input = contentEl.createEl('input');
      input.type = 'number';
      const addButton = contentEl.createEl('button', { text: 'Add' });
      addButton.onclick = () => {
          const number = parseInt(input.value);
          if (!isNaN(number)) {
              this.plugin.insertDocument(String(number), this.editor);
              this.close();
          } else {
              new Notice('Please enter a valid number.');
          }
      };
  }

  onClose() {
      const { contentEl } = this;
      contentEl.empty();
  }
}


