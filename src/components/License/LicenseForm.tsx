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

export interface IProps {}
export interface IState {
  licenseKey: string;
}

class LicenseForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {
      licenseKey: '',
    };
  }

  componentDidMount(): void {
    ipcRenderer.on(appConst.ACTIVATE_LICENSE_RESPONSE, (event, data) => {
      console.log('onReceiveAnswerFromApi', event, data);
      const { success } = data;
      console.log(success);
      if (success === undefined) {
        console.log(
          'License data does not match API or internet connection lost'
        );
        // this.props.dispatch({
        //   type: 'setLicenseErrorMessage',
        //   load: 'License data does not match API',
        // });
      } else if (success === false) {
        console.log('License key does not exist.');
        // this.props.dispatch({
        //   type: 'setLicenseErrorMessage',
        //   load: 'License key does not exist.',
        // });
      } else if (data.uses > 1) {
        console.log('License key already in use.');
        // this.props.dispatch({
        //   type: 'setLicenseErrorMessage',
        //   load: 'License key already in use.',
        // });
      } else {
        console.log('License accepted');
        // checkLicense(createLicense(data), this.props.dispatch, true);
      }
      // this.setState({ waitingForAnswer: false });
    });
  }

  handleClose = () => {
    const { setShowLicenseDialog } = this.props;
    setShowLicenseDialog(false);
  };

  acquireLicense = () => {};

  activate = () => {
    const { licenseKey } = this.state;
    ipcRenderer.send(appConst.ACTIVATE_LICENSE, licenseKey);
  };

  render(): React.ReactElement {
    const { licenseDialogVisible } = this.props;
    return (
      <Modal show={licenseDialogVisible}>
        <Modal.Header>
          <Modal.Title>License required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {`This function requires a license.  `}
          <Button variant="primary" onClick={this.acquireLicense}>
            Acquire license
          </Button>
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
};

const mapStateToProps = (state: StoreType, ownProps: IProps) => {
  return {
    licenseDialogVisible: state.license.licenseDialogVisible,
  };
};

type StatePropsType = ReturnType<typeof mapStateToProps>;
type DispatchPropsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(LicenseForm);
