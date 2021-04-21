import './license-form.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { Button, FormControl, InputGroup, Modal } from 'react-bootstrap';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { actions as licenseActions } from '../../reduxStore/licenseSlice';
import { getNewExpiringDate } from '../../utils/dateUtils';

const { shell } = window.require('electron');

export interface IProps {}
export interface IState {
  licenseKey: string;
  messageToShow: string;
}

class LicenseForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      licenseKey: '',
      messageToShow: '',
    };
  }

  componentDidMount(): void {
    ipcRenderer.on(appConst.ACTIVATE_LICENSE_RESPONSE, (event, data) => {
      const { licenseKey } = this.state;
      const { setLicenseInfo } = this.props;
      const { success } = data;
      if (success === undefined) {
        this.setState({
          messageToShow:
            'License data does not match API or internet connection lost',
        });
      } else if (success === false) {
        this.setState({
          messageToShow: 'License key does not exist.',
        });
      } else if (data.uses > 1) {
        this.setState({
          messageToShow: 'License key already in use.',
        });
      } else {
        this.setState({
          messageToShow: 'License accepted',
        });
        ipcRenderer.send(appConst.SAVE_LICENSE_INFORMATION, licenseKey);
        setLicenseInfo({ licenseKey, expiringDate: getNewExpiringDate() });
        this.handleClose();
      }
    });
    ipcRenderer.on(
      appConst.LOAD_LICENSE_INFORMATION_RESPONSE,
      (event, content) => {
        const { setLicenseInfo } = this.props;
        if (content.licenseKey && content.expiringDate)
          setLicenseInfo({
            licenseKey: content.licenseKey,
            expiringDate: content.expiringDate,
          });
        else ipcRenderer.send(appConst.CHANGE_TITLE, `(License error)`);
      }
    );
    ipcRenderer.send(appConst.LOAD_LICENSE_INFORMATION);
  }

  handleClose = () => {
    const { setShowLicenseDialog } = this.props;
    setShowLicenseDialog(false);
  };

  acquireLicense = () => {
    // CHANGE LINK HERE
    let link = 'http://google.com';
    shell.openExternal(link);
  };

  activate = () => {
    const { licenseKey } = this.state;
    this.setState({ messageToShow: '' });
    ipcRenderer.send(appConst.ACTIVATE_LICENSE, licenseKey);
  };

  render(): React.ReactElement {
    const { licenseDialogVisible } = this.props;
    const { messageToShow } = this.state;
    return (
      <Modal show={licenseDialogVisible} onHide={this.handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>License required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="license-acquire-row">
            <h6>This function requires a license.</h6>
            <Button variant="primary" onClick={this.acquireLicense}>
              Acquire license
            </Button>
          </div>
          {messageToShow ? messageToShow : <br />}
        </Modal.Body>
        <Modal.Footer>
          <InputGroup>
            <FormControl
              placeholder="Enter license code"
              onChange={(event) =>
                this.setState({ licenseKey: event.target.value })
              }
            />
            <InputGroup.Append>
              <Button variant="primary" onClick={this.activate}>
                Activate
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapDispatchToProps = {
  setShowLicenseDialog: licenseActions.setShowLicenseDialog,
  setLicenseInfo: licenseActions.setLicenseInfo,
};

const mapStateToProps = (state: StoreType, ownProps: IProps) => {
  return {
    licenseDialogVisible: state.license.licenseDialogVisible,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LicenseForm);
