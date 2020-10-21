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
      <MiddleSpace visible={true} />
      <RightBar visible={true} />
    </div>
  );
};
