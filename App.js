import axios from 'axios';
import React from 'react';
import {
  SafeAreaView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {StringeeCall, StringeeClient} from 'stringee-react-native';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myUserId: '',
      phone: '84',
      hasConnected: true,
      stringeeMessage: 'STRINGEE',
    };

    this.clientEventHandlers = {
      onConnect: this._clientDidConnect,
      onDisConnect: this._clientDidDisConnect,
      onFailWithError: this._clientDidFailWithError,
      onRequestAccessToken: this._clientRequestAccessToken,
      onIncomingCall: this._callIncomingCall,
    };

    this.callEventHandlers = {
      onChangeSignalingState: this._callDidChangeSignalingState,
      onChangeMediaState: this._callDidChangeMediaState,
      onReceiveLocalStream: this._callDidReceiveLocalStream,
      onReceiveRemoteStream: this._callDidReceiveRemoteStream,
      onReceiveDtmfDigit: this._didReceiveDtmfDigit,
      onReceiveCallInfo: this._didReceiveCallInfo,
      onHandleOnAnotherDevice: this._didHandleOnAnotherDevice,
    };

    this.stringeeCallRef = React.createRef();
    this.stringeeClientRef = React.createRef();
  }

  _clientDidConnect = ({userId}) => {
    console.log('_clientDidConnect - ' + userId);
    this.setState({
      myUserId: userId,
      hasConnected: true,
    });
  };

  _clientDidDisConnect = () => {
    this.setState({
      myUserId: '',
      hasConnected: false,
    });
  };

  _clientDidFailWithError = (error) => {
    console.log('_clientDidFailWithError: ', error);
  };

  _clientRequestAccessToken = () => {
    console.log('_clientRequestAccessToken');
    // Token để kết nối tới Stringee server đã hết bạn. Bạn cần lấy token mới và gọi connect lại ở đây
    // this.refs.client.connect("NEW_TOKEN");
  };

  // Call events
  _callIncomingCall = ({
    callId,
    from,
    to,
    fromAlias,
    toAlias,
    callType,
    isVideoCall,
    customDataFromYourServer,
  }) => {
    console.log(
      'IncomingCallId-' +
        callId +
        ' from-' +
        from +
        ' to-' +
        to +
        ' fromAlias-' +
        fromAlias +
        ' toAlias-' +
        toAlias +
        ' isVideoCall-' +
        isVideoCall +
        'callType-' +
        callType +
        'customDataFromYourServer-' +
        customDataFromYourServer,
    );

    // this.props.navigation.navigate('Call', {
    //   callId: callId,
    //   from: from,
    //   to: to,
    //   isOutgoingCall: false,
    //   isVideoCall: isVideoCall,
    // });
  };

  async componentDidMount() {
    try {
      await this._requestAndroidPermission();
      const url =
        Platform.OS === 'ios'
          ? 'http://localhost:8000/token'
          : 'http://10.0.2.2:8000/token';

      const response = await axios.get(url);

      const {accessToken} = response.data;
      await this.stringeeClientRef.current.connect(accessToken);
    } catch (error) {
      console.log('componentDidMount catch error: ', error);
    }
  }

  // Invoked when the call signaling state changes
  _callDidChangeSignalingState = ({
    callId,
    code,
    reason,
    sipCode,
    sipReason,
  }) => {
    const message =
      'callId-' +
      callId +
      'code-' +
      code +
      ' reason-' +
      reason +
      ' sipCode-' +
      sipCode +
      ' sipReason-' +
      sipReason;
    this.setState({stringeeMessage: message});
  };

  // Invoked when the call media state changes
  _callDidChangeMediaState = ({callId, code, description}) => {
    console.log(
      'callId-' + callId + 'code-' + code + ' description-' + description,
    );
  };

  // Invoked when the local stream is available
  _callDidReceiveLocalStream = ({callId}) => {
    console.log('_callDidReceiveLocalStream ' + callId);
  };
  // Invoked when the remote stream is available
  _callDidReceiveRemoteStream = ({callId}) => {
    console.log('_callDidReceiveRemoteStream ' + callId);
  };

  // Invoked when receives a DMTF
  _didReceiveDtmfDigit = ({callId, dtmf}) => {
    console.log('_didReceiveDtmfDigit ' + callId + '***' + dtmf);
  };

  // Invoked when receives info from other clients
  _didReceiveCallInfo = ({callId, data}) => {
    console.log('_didReceiveCallInfo ' + callId + '***' + data);
  };

  // Invoked when the call is handled on another device
  _didHandleOnAnotherDevice = ({callId, code, description}) => {
    console.log(
      '_didHandleOnAnotherDevice ' +
        callId +
        '***' +
        code +
        '***' +
        description,
    );
  };

  _makeCall() {
    const myObj = {
      from: '842473030086',
      to: this.state.phone,
      isVideoCall: false,
    };

    const parameters = JSON.stringify(myObj);

    this.stringeeCallRef.current.makeCall(
      parameters,
      (status, code, message, callId) => {
        console.log(
          'status-' +
            status +
            ' code-' +
            code +
            ' message-' +
            message +
            'callId-' +
            callId,
        );
        if (status) {
          // Sucess
        } else {
          // Fail
        }
      },
    );
  }

  async _requestAndroidPermission() {
    try {
      if (Platform.OS === 'ios') return;
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      ]);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return console.log('Permission granted');
      }

      return console.log('Permission denied');
    } catch (error) {
      console.warn(error);
    }
  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>Current login as: {this.state.myUserId}</Text>
            <TextInput
              placeholder="Nhập số điện thoại..."
              value={this.state.phone}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: 'grey',
                borderRadius: 4,
                minWidth: 200,
                marginVertical: 32,
              }}
              onChangeText={(value) =>
                this.setState({phone: value})
              }></TextInput>
            <TouchableOpacity
              onPress={this._makeCall.bind(this)}
              style={{
                backgroundColor: 'steelblue',
                paddingHorizontal: 80,
                paddingVertical: 8,
                borderRadius: 4,
              }}>
              <Text style={{color: 'white'}}>Gọi {this.state.phone}</Text>
            </TouchableOpacity>
            <Text style={{position: 'absolute', bottom: 32}}>
              {this.state.stringeeMessage}
            </Text>
          </View>
          <View>
            <StringeeClient
              ref={this.stringeeClientRef}
              eventHandlers={this.clientEventHandlers}
            />
            <StringeeCall
              ref={this.stringeeCallRef}
              eventHandlers={this.callEventHandlers}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }
}

export default App;
