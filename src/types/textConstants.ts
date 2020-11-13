// app state:
export const START_PAGE = 'start-page';
export const PROJECT_EDIT_FORM = 'project-edit-form';
export const PDF_VIEWER = 'pdf-viewer';
export const EVENT_FORM = 'event-form';
export const EMTPY_SCREEN = 'empty-screen';

// main process listeners:
export const OPEN_FILE = 'open-file';
export const SHOW_NEW_FILE_DIALOG = 'show-new-file-dialog';
export const LOAD_PDF_FILE = 'load-pdf-file';
export const SAVE_CURRENT_PROJECT = 'save-current-project';
export const ADD_TO_RECENT_PROJECTS = 'add-to-recent-projects';
export const DELETE_FROM_RECENT_PROJECTS = 'delete-from-recent-projects';
export const GET_RECENT_PROJECTS = 'get-recent-projects';

// renderer process listeners:
export const OPEN_FILE_DIALOG_RESPONSE = 'open-file-dialog-response';
export const NEW_FILE_DIALOG_RESPONSE = 'new-file-dialog-response';
export const PDF_FILE_CONTENT_RESPONSE = 'pdf-file-content-response';
export const SAVE_CURRENT_PROJECT_DONE = 'save-current-project-done';
export const ADD_TO_RECENT_PROJECTS_DONE = 'add-to-recent-projects-done';
export const DELETE_FROM_RECENT_PROJECTS_DONE = 'delete-from-recent-projects-done';
export const GET_RECENT_PROJECTS_RESPONSE = 'get-recent-projects-response';

// files:
export const RECENT_PROJECTS_FILENAME = 'recent.json';

// other:
export const OPENED_PROJECTS_PATH = '.openedProjects/';
