import * as React from 'react';
import { PDFView } from './pdfView';

export interface ILayoutProps {}

export const Layout: React.FunctionComponent<ILayoutProps> = () => {
  return (
    <div className="layout">
      <div className="container">
        <div className="sidebar">Sidebar</div>
        <div className="header">
          <h1>My Application</h1>
        </div>
        <div className="body">
          <PDFView />
        </div>
        <div className="footer">
          <p>Footer</p>
        </div>
      </div>
    </div>
  );
};
