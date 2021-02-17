import './license-form.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { StoreType } from '../../reduxStore/store';
import * as appConst from '../../types/textConstants';
import { actions as projectFileActions } from '../../reduxStore/projectFileSlice';
import { actions as pdfViewerActions } from '../../reduxStore/pdfViewerSlice';
import { actions as appStateActions } from '../../reduxStore/appStateSlice';
import { actions as editingEventActions } from '../../reduxStore/editingEventSlice';
import { actions as licenseActions } from '../../reduxStore/licenseSlice';
import { Button, Modal } from 'react-bootstrap';

export interface IProps {}
export interface IState {}

class LicenseForm extends React.Component<
  StatePropsType & DispatchPropsType,
  IState
> {
  constructor(props: StatePropsType & DispatchPropsType) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {}

  handleClose = () => {
    const { setShowLicenseDialog } = this.props;
    setShowLicenseDialog(false);
  };

  acquireLicense = () => {};

  activate = () => {};

  render(): React.ReactElement {
    const { licenseDialogVisible } = this.props;
    return (
      <Modal show={licenseDialogVisible}>
        <Modal.Header closeButton>
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
            onChange={(event) => {}}
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
