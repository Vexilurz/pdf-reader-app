import './license-form.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { Button, Modal } from 'react-bootstrap';
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
      const { setLicenseKey, setExpiringDate } = this.props;
      const { success } = data;
      console.log('success: ', success);
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
        setExpiringDate(getNewExpiringDate());
        setLicenseKey(licenseKey);
        this.handleClose();
      }
    });
    ipcRenderer.on(
      appConst.LOAD_LICENSE_INFORMATION_RESPONSE,
      (event, content) => {
        const { setLicenseKey, setExpiringDate } = this.props;
        console.log(content.licenseKey, content.expiringDate);
        if (content.licenseKey) setLicenseKey(content.licenseKey);
        if (content.expiringDate) setExpiringDate(content.expiringDate);
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
    ipcRenderer.send(appConst.ACTIVATE_LICENSE, licenseKey);
  };

  render(): React.ReactElement {
    const { licenseDialogVisible } = this.props;
    const { messageToShow } = this.state;
    return (
      <Modal show={licenseDialogVisible} onHide={this.handleClose}>
        <Modal.Header>
          <Modal.Title>License required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {`This function requires a license.  `}
          <Button variant="primary" onClick={this.acquireLicense}>
            Acquire license
          </Button>
          {messageToShow}
        </Modal.Body>
        <Modal.Footer>
          <input
            className="license-key-input"
            type="text"
            style={{
              width: '350px',
              marginRight: '50px',
            }}
            onChange={(event) =>
              this.setState({ licenseKey: event.target.value })
            }
            // C8893012-CF6843BB-B3DC3269-24065763
          />
          <Button variant="primary" onClick={this.activate}>
            Activate
          </Button>
          <Button variant="secondary" onClick={this.handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapDispatchToProps = {
  setShowLicenseDialog: licenseActions.setShowLicenseDialog,
  setLicenseKey: licenseActions.setLicenseKey,
  setExpiringDate: licenseActions.setExpiringDate,
};

const mapStateToProps = (state: StoreType, ownProps: IProps) => {
  return {
    licenseDialogVisible: state.license.licenseDialogVisible,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LicenseForm);
