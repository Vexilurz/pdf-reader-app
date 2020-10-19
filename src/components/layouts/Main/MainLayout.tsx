import './main-layout.scss';
import * as React from 'react';
import TopBar from '../TopBar/TopBar';
import LeftBar from '../LeftBar/LeftBar';
import RightBar from '../RightBar/RightBar';
import MiddleSpace from '../MiddleSpace/MiddleSpace';

export interface ILayoutProps {}

export const MainLayout: React.FunctionComponent<ILayoutProps> = () => {
  return (
    <div className="main-layout">
      <TopBar visible={true} />
      <LeftBar visible={true} />
      <RightBar visible={true} />
      <MiddleSpace visible={true} />
      {/* <div className="container">
        <div className="sidebar">Sidebar</div>
        <div className="header">
          <h1>My Application</h1>
        </div>
        <div className="body">
          <PDFViewer />
        </div>
        <div className="footer">
          <p>Footer</p>
        </div>
      </div> */}
    </div>
  );
};
