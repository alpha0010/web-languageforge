'use strict';

angular.module('lexicon.services')

// Lexicon Entry Service
.factory('lexEditorDataService', ['$q', 'editorDataService', 'lexEntryApiService', 'lexUtils',
function ($q, editorDataService, api, utils) {

  editorDataService.registerEntryApi(api);
  editorDataService.registerUtilityLibrary(utils);

  return {
    loadEditorData: editorDataService.loadEditorData,
    refreshEditorData: editorDataService.refreshEditorData,
    removeEntryFromLists: editorDataService.removeEntryFromLists,
    addEntryToEntryList: editorDataService.addEntryToEntryList,
    getIndexInEntries: editorDataService.getIndexInEntries,
    getIndexInVisibleEntries: editorDataService.getIndexInVisibleEntries,
    entries: editorDataService.entries,
    visibleEntries: editorDataService.visibleEntries,
    visibleSimpleEntriesForCompactList: editorDataService.visibleSimpleEntriesForCompactList,
    showInitialEntries: editorDataService.showInitialEntries,
    showMoreEntries: editorDataService.showMoreEntries
  };

}]);
