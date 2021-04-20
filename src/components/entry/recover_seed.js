import React from "react";
import { Row, Col, Form, Image } from "react-bootstrap";
import { recover_from_seed_util } from "../../utils/wallet_creation";

import WalletHome from "../wallet/home";

import ProgressIcon from "../customComponents/ProgressIcon";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { IconContext } from "react-icons";
import ReactTooltip from "react-tooltip";

const safex = window.require("safex-nodejs-libwallet");

let { dialog } = window.require("electron").remote;

export default class RecoverSeed extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      daemon_host: "",
      daemon_port: 0,
      new_path: "",
      password: "",
      safex_key: null,
      success: false,
      network: "mainnet",
      testnet: false,
      wallet: null,
      wallet_made: false,
      seed: "",
      seed_set: false,
      loading: false,
      freshStart: true,
      pageNumber: 0,
    };
  }

  async componentDidMount() {}

  set_path = (e) => {
    e.preventDefault();

    let sails_path = dialog.showSaveDialogSync();
    let new_path = sails_path;

    try {
      if (new_path.length > 0) {
        this.setState({ new_path: new_path });
      }
    } catch (err) {
      console.log("cancelled, no path set");
    }
  };

  change_path = (e) => {
    e.preventDefault();
    this.setState({ new_path: "" });
  };
  set_daemon_state = (e) => {
    e.preventDefault();
    this.setState({
      daemon_host: e.target.daemon_host.value,
      daemon_port: parseInt(e.target.daemon_port.value),
    });
  };

  change_daemon = (e) => {
    e.preventDefault();
    this.setState({ daemon_host: "", daemon_port: 0 });
  };

  set_password = (e) => {
    e.preventDefault();
    if (e.target.password.value === e.target.repeat_password.value) {
      this.setState({ password: e.target.password.value, pageNumber: 4 });
    } else {
      alert("passwords dont match");
    }
  };

  change_password = (e) => {
    e.preventDefault();
    this.setState({ password: "" });
  };

  make_wallet_result = async (error, wallet) => {
    if (error) {
      this.setState({ loading: false });
      alert(error);
    } else {
      this.setState({ wallet_made: true, wallet: wallet, loading: false });
    }
  };

  make_wallet = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    try {
      let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
      recover_from_seed_util(
        this.state.new_path,
        this.state.password,
        0,
        this.state.network,
        daemon_string,
        this.state.seed,
        this.make_wallet_result
      );
    } catch (err) {
      this.setState({ loading: false });
      console.error(err);
      console.error("error on initial recovery");
      alert("error on initial recovery11");
    }
  };

  set_to_testnet = (e) => {
    e.preventDefault();
    const target = e.target;
    if (target.checked === true) {
      this.setState({
        testnet: true,
        network: "testnet",
      });
    } else {
      this.setState({
        testnet: false,
        network: "mainnet",
      });
    }
  };

  show_password = (e) => {
    e.preventDefault();
    alert(this.state.password);
  };

  set_seed = (e) => {
    e.preventDefault();
    let words = e.target.seed.value.trim().split(" ");
    if (words.length === 25) {
      try {
        this.setState({
          seed: e.target.seed.value.trim(),
          seed_set: true,
          pageNumber: 1,
        });
      } catch (err) {
        console.error(err);
        console.error("error at setting the mnemonic");
      }
    } else {
      alert(
        `You have not included the right amount of words: you provided ${words.length} / 25`
      );
    }
  };

  reset_keys = (e) => {
    this.setState({
      public_address: "",
      viewkey: "",
      spendkey: "",
    });
  };

  backToSelect = () => {
    this.props.history.push({ pathname: "/select_entry" });
  };

  goBack = (e) => {
    e.preventDefault();
    if (this.state.pageNumber > 0) {
      console.log(this.state.pageNumber);
      return this.setState({ pageNumber: this.state.pageNumber - 1 });
    }

    this.backToSelect();
  };

  exit_home = (e) => {
    e.preventDefault();
    this.props.history.push({ pathname: "/" });
  };

  reset_seed = (e) => {
    this.setState({ seed_set: false });
  };

  render() {
    return (
      <div className={"w-100 h-100"}>
        {this.state.wallet_made && this.state.loading === false ? (
          <div fluid className="w-100 h-100">
            <WalletHome
              wallet={this.state.wallet}
              daemon_host={this.state.daemon_host}
              daemon_port={this.state.daemon_port}
              password={this.state.password}
              wallet_path={this.state.new_path}
            />
          </div>
        ) : (
          <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
            <div className="start-background-image w-100 h-100 d-flex flex-column justify-content-center align-items-center">
              <Image
                onClick={() => {
                  alert("Closing Wallet... (TEST)");
                }}
                className="entry-off-button pointer"
                src={require("./../../img/off_black.svg")}
              />

              <Row className="entry-progress-row">
                <Col
                  onClick={this.goBack}
                  className="d-flex align-items-center entry-back-text pointer"
                  md={2}
                >
                  <IconContext.Provider
                    value={{ color: "#13D3FD", size: "3rem" }}
                  >
                    <IoIosArrowBack />
                  </IconContext.Provider>
                  BACK
                </Col>

                <ProgressIcon
                  amount={4}
                  number={1}
                  color={
                    this.state.pageNumber === 0
                      ? "progress-icon-color"
                      : this.state.seed_set
                      ? "progress-icon-color-complete"
                      : ""
                  }
                  title={"SEED PHRASE"}
                />

                <ProgressIcon
                  amount={4}
                  number={2}
                  title={"SAVE FILES"}
                  color={
                    this.state.pageNumber === 1
                      ? "progress-icon-color"
                      : this.state.new_path.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                />

                <ProgressIcon
                  amount={4}
                  number={3}
                  title={"NETWORK CONNECTION"}
                  color={
                    this.state.pageNumber === 2
                      ? "progress-icon-color"
                      : this.state.daemon_host.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                />

                <ProgressIcon
                  amount={4}
                  number={4}
                  title={"YOUR PASSWORD"}
                  color={
                    this.state.pageNumber === 3
                      ? "progress-icon-color"
                      : this.state.password.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                />
              </Row>

              {this.state.wallet_made && (
                <div className="w-100 h-100">
                  <WalletHome
                    wallet={this.state.wallet}
                    daemon_host={this.state.daemon_host}
                    daemon_port={this.state.daemon_port}
                    password={this.state.password}
                    wallet_path={this.state.new_path}
                  />
                </div>
              )}

              {this.state.pageNumber === 0 ? (
                <div className="entry-container">
                  <p className="h3">Enter your Seed Phrase</p>

                  <Form id="set_seed" onSubmit={this.set_seed}>
                    <Form.Control
                      className="w-100"
                      name="seed"
                      as="textarea"
                      rows="3"
                    />

                    <button
                      className="w-100 mt-2 custom-button-entry orange-border"
                      type="submit"
                    >
                      Set Seed
                    </button>
                  </Form>
                </div>
              ) : (
                ""
              )}

              {this.state.pageNumber === 1 ? (
                <div>
                  {this.state.new_path.length > 0 ? (
                    <div className="entry-container">
                        <p className="h3">
                          {" "}
                          This file will be saved to:{" "}
                          <br /><i>{this.state.new_path}</i>
                        </p>

                        <button
                          className="w-100 mt-3 mx-auto custom-button-entry"
                          onClick={this.change_path}
                        >
                          Change Path
                        </button>

                        <button
                          className="w-100 mt-2 mx-auto custom-button-entry orange-border"
                          onClick={() => this.setState({ pageNumber: 2 })}
                        >
                          Continue
                        </button>
                    </div>
                  ) : (
                    <div className="entry-container">
                      <p className="h3">
                        Where would you like to save your new Safex Wallet
                        Files?
                      </p>
                      <Form
                        className="mt-2 mb-2"
                        id="set_path"
                        onSubmit={this.set_path}
                      >
                        <input className="display-none" type="file" />
                          <button
                            className="w-100 mt-2 mx-auto custom-button-entry orange-border"
                            type="submit"
                            variant="primary"
                          >
                            Select File Path
                          </button>
                      </Form>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {this.state.new_path.length > 0 && this.state.pageNumber === 2 ? (
                <div className="entry-container">
                  {this.state.daemon_host.length < 1 ? (
                    <form
                      id="set_daemon"
                      onSubmit={this.set_daemon_state}
                      className=""
                    >
                      <label className="entry-form-label" htmlFor="daemon-host">
                        Daemon Host:
                        <AiOutlineInfoCircle className="ml-3" size={15} data-tip data-for="daemonHostInfo" />
                      <ReactTooltip
                        id="daemonHostInfo"
                        type="info"
                        effect="solid"
                        place="bottom"
                      >
                        <span>
                          This is the URL used to connect to the Safex
                          blockchain.
                          <br />
                          You can use the default provided by the Safex
                          Foundation
                          <br />
                          or replace it with your own full node.
                          <br />
                          <br />
                          <ul className="mb-4">
                            <li>
                              The default self hosted wallet setup would be:
                            </li>
                            <li className="mt-4">
                              HOST: <b>127.0.0.1</b>
                            </li>
                            <li className="mt-1">
                              PORT: <b>17402</b>
                            </li>
                            <li className="mt-2">
                              The default is rpc.safex.org:30393
                            </li>
                          </ul>
                        </span>
                      </ReactTooltip>
                      </label>

                      <input
                        id="daemon-host"
                        className="my-2 entry-form-input"
                        name="daemon_host"
                        defaultValue="rpc.safex.org"
                        placedholder="set the ip address of the safex blockchain"
                      />

                      <label htmlFor="daemon-port">Daemon Port:</label>

                      <input
                        id="daemon-port"
                        className="mt-2 mb-3"
                        name="daemon_port"
                        defaultValue="17402"
                        placedholder="set the port of the safex blockchain"
                      />

                      <button
                        className="w-100 custom-button-entry orange-border"
                        type="submit"
                        variant="primary"
                        size="lg"
                      >
                        Set Connection
                      </button>
                    </form>
                  ) : (
                    <div className="d-flex flex-column justify-content-around h-100">
                      <p className="h3">
                        You will be connected to:
                        <br />
                        <i>
                          {this.state.daemon_host}:{this.state.daemon_port}
                        </i>
                      </p>

                      <button
                        className="w-100 mt-2 custom-button-entry"
                        onClick={() =>
                          this.setState({ daemon_host: "", daemon_port: 0 })
                        }
                      >
                        Reset Connection
                      </button>

                      <button
                        className="w-100 mt-2 mx-auto custom-button-entry orange-border"
                        onClick={() => this.setState({ pageNumber: 3 })}
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {this.state.pageNumber === 3 ? (
                <div className="entry-container">
                  <form
                    id="set_password"
                    className=""
                    onSubmit={this.set_password}
                  >
                    <label htmlFor="password-input">Choose a password</label>

                    <input
                      id="password-input"
                      type="password"
                      name="password"
                      className="mt-2 mb-2"
                    />

                    <label htmlFor="repeat-password-input">
                      Confirm your password
                    </label>

                    <input
                      id="repeat-password-input"
                      name="repeat_password"
                      className="mt-2 mb-2"
                      type="password"
                    />

                    <button
                      type="submit"
                      className="w-100 mt-2 custom-button-entry orange-border"
                    >
                      Set Password
                    </button>
                  </form>
                </div>
              ) : (
                ""
              )}

              {this.state.new_path.length > 0 &&
              this.state.daemon_host.length > 0 &&
              this.state.wallet_made === false &&
              this.state.password.length > 0 &&
              this.state.pageNumber === 4 ? (
                <div className="entry-container">
                  <p className="h3">
                    This file will be saved to: <br /><i>{this.state.new_path}</i>
                  </p>

                  <button
                    onClick={this.make_wallet}
                    className="w-100 mt-2 mx-auto custom-button-entry orange-border"
                  >
                    Restore Wallet
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
