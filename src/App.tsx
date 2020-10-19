import './styles/main.scss';
import * as React from 'react';
// import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { MainLayout } from './components/layouts/Main/MainLayout';

export default function App() {
  return (
    // <BrowserRouter>
    <MainLayout />
    // </BrowserRouter>
  );
}
