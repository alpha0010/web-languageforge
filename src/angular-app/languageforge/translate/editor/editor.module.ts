import * as angular from 'angular';
import uiRouter from 'angular-ui-router';
import { WordParser } from './word-parser.service';
import { DocumentDataService } from './document-data.service';
import { EditorComponent } from './editor.component';
import { TranslateCoreModule } from '../core/translate-core.module';
import { QuillModule } from './quill/quill.module';

export const EditorModule = angular
  .module('editorModule', [uiRouter, 'ui.bootstrap', 'bellows.services',
    TranslateCoreModule, QuillModule, 'palaso.ui.showOverflow'])
  .service('wordParser', WordParser)
  .service('documentDataService', DocumentDataService)
  .component('editorComponent', EditorComponent)
  .name;