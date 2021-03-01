import os from 'os';
import * as pathLib from 'path';

// app state:
export const START_PAGE = 'start-page';
export const PROJECT_EDIT_FORM = 'project-edit-form';
export const PDF_VIEWER = 'pdf-viewer';
export const EVENT_FORM = 'event-form';
export const EMTPY_SCREEN = 'empty-screen';

// main process listeners:
export const OPEN_FILE = 'open-file';
export const OPEN_EXTERNAL_PDF = 'open-external-pdf';
export const SHOW_SAVE_FILE_DIALOG = 'show-save-file-dialog';
export const LOAD_PDF_FILE = 'load-pdf-file';
export const PRINT_PDF_FILE = 'print-pdf-file';
export const SAVE_CURRENT_PROJECT = 'save-current-project';
export const ADD_TO_RECENT_PROJECTS = 'add-to-recent-projects';
export const DELETE_FROM_RECENT_PROJECTS = 'delete-from-recent-projects';
export const GET_RECENT_PROJECTS = 'get-recent-projects';
export const CREATE_FOLDER_IN_CACHE = 'create-folder-in-cache';
export const DELETE_FOLDER_FROM_CACHE = 'delete-folder-from-cache';
export const CLEAR_CACHE = 'clear-cache';
export const UPDATE_EVENT_IN_CACHE = 'update-event-in-cache';
export const APP_CLOSING = 'app-closing';
export const ACTIVATE_LICENSE = 'activate-license';
export const SAVE_LICENSE_INFORMATION = 'save-license-information';
export const LOAD_LICENSE_INFORMATION = 'load-license-information';
export const CHANGE_TITLE = 'change-title';

// renderer process listeners:
export const OPEN_FILE_DIALOG_RESPONSE = 'open-file-dialog-response';
export const NEW_FILE_DIALOG_RESPONSE = 'new-file-dialog-response';
export const NEW_FILE_DIALOG_RESPONSE_2 = 'new-file-dialog-response-2';
export const PDF_FILE_CONTENT_RESPONSE = 'pdf-file-content-response';
export const SAVE_CURRENT_PROJECT_DONE = 'save-current-project-done';
export const ADD_TO_RECENT_PROJECTS_DONE = 'add-to-recent-projects-done';
export const DELETE_FROM_RECENT_PROJECTS_DONE = 'delete-from-recent-projects-done';
export const GET_RECENT_PROJECTS_RESPONSE = 'get-recent-projects-response';
export const UPDATE_EVENT_IN_CACHE_COMPLETE = 'update-event-in-cache-complete';
export const APP_CLOSING_PERMISSION_GRANTED = 'app-closing-permission-granted';
export const ACTIVATE_LICENSE_RESPONSE = 'activate-license-response';
export const LOAD_LICENSE_INFORMATION_RESPONSE = 'load-license-information-response';

// other:
export const APP_FOLDER = pathLib.join(os.homedir(), 'documentsApp' + pathLib.sep);
export const CACHE_PATH = pathLib.join(APP_FOLDER, '.documentsAppCache' + pathLib.sep);
export const RECENT_PROJECTS_FILENAME = pathLib.join(APP_FOLDER, 'recent.json');
export const PROJECT_FILE_NAME = 'project.json';
export const LICENSE_FILE_NAME = '.license';
export const TRIAL_KEY = 'TRIAL';
export const SECRET_KEY = 'DocumentAppSecretKeyThere';
