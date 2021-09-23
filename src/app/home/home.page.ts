/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import { NetworkInterface } from '@ionic-native/network-interface/ngx';
import { Uid } from '@ionic-native/uid/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Platform } from '@ionic/angular';
import { Globalization } from '@ionic-native/globalization/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { HTTP } from '@ionic-native/http/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  ip;
  ipPrivada;
  ipPublica;
  proxxy;
  error;
  //app
  imei;
  iccid;
  imsi;
  mac;

  model: any;
  platform: any;
  Uuid: any;
  WifiInfo: any;
  auxwifiInfo: any;
  iana: any;
  timezone: any;
  UTC: any;
  // Location coordinates
  latitude: number;
  longitude: number;
  accuracy: number;
  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  address;


  constructor(
    private networkInterface: NetworkInterface,
    private uid: Uid,
    private androidPermissions: AndroidPermissions,
    public device: Device,
    platform: Platform,
    private globalization: Globalization,
    private geolocation: Geolocation,
    private http: HTTP,
    private nativeGeocoder: NativeGeocoder) {
    this.getPermission();
    platform.ready().then(() => {
      //  this.sensors.enableSensor(TYPE_SENSOR.PROXIMITY);
      // this.initSensor();
      this.WifiInfo.getWifiInfo(wifiInfo => this.auxwifiInfo = wifiInfo,
        wifiError => console.log(wifiError));
    });

  }

  async ngOnInit() {
    await this.getDeviceInfo();
    await this.obtenercoordenadas();
    await this.obtenerzonahoraria();
    const flag = await this.getIpPrivada();
    const flaguno = await this.getIpPublica();
    const flagdos = await this.getProxxy();
  }

  obtenercoordenadas() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;
      this.getGeoencoder(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude, longitude) {
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.address = this.generateAddress(result[0]);
      })
      .catch((error: any) => {
        alert('Error getting location' + JSON.stringify(error));
      });
  }
  generateAddress(addressObj) {
    const obj = [];
    let address = '';
    // eslint-disable-next-line guard-for-in
    for (const key in addressObj) {
      obj.push(addressObj[key]);
    }
    obj.reverse();
    for (const val in obj) {
      if (obj[val].length){
        address += obj[val] + ', ';
      }
    }
    return address.slice(0, -2);
  }

  obtenerzonahoraria() {
    this.globalization.getDatePattern({ formatLength: 'short', selector: 'date and time' })
      .then(res => {
        this.iana = res.iana_timezone;
        this.timezone = res.timezone;
        this.UTC = res.utc_offset;
      })
      .catch(e => console.log(e));
  }

  getDeviceInfo() {
    this.model = this.device.manufacturer + '/' + this.device.model;
    this.platform = this.device.platform + ' ' + this.device.version;
    this.Uuid = this.device.uuid;
    this.imei = this.uid.IMEI;
    this.iccid = this.uid.ICCID;
    this.imsi = this.uid.IMSI;
    this.mac = this.uid.MAC;
  }

  getIpPrivada() {
    return new Promise(resolve => {
      this.networkInterface.getWiFiIPAddress()
        .then(address => this.ipPrivada = address.ip)
        .catch(error => console.error(`Unable to get IP: ${error}`));
    });
  }

  getIpPublica() {
    return new Promise(resolve => {
    this.http.get('http://api.ipify.org/?format=text', {}, {})
    .then(data => {
      this.ipPublica = data.data;
      })
    .catch(error => {
      console.log(error.status);
      console.log(error.error); // error message as string
      console.log(error.headers);
    });
  });
  }

  getProxxy() {
    return new Promise(resolve => {
      const url = 'www.github.com';
      this.networkInterface.getHttpProxyInformation(url)
        .then(proxy => this.proxxy = proxy.host)
        .catch(error => console.log(`Unable to get proxy info: ${error}`));
    });
  }

  //de la app
  getPermission() {
    //PERMISOS
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(
      result => console.log('Has permission?', result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE)
    );
    // eslint-disable-next-line max-len
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_PHONE_STATE, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
  }

  getwifiinfo() {


 }
 nombres(){

  this.http.get('http://api.ipify.org/?format=text', {}, {})
  .then(data => {

    console.log(data.status);
    console.log(data.data); // data received by server
    console.log(data.headers);
    this.ipPublica = data.data;

  })
  .catch(error => {

    console.log(error.status);
    console.log(error.error); // error message as string
    console.log(error.headers);

  });
 }

}
