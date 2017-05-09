var _ = require('lodash');
var usb = require('usb');

var horusVendorId = 7531;
var horusProductId = 258;
var horus;

function attachDevice(device) {
    horus = device;
    horus.open();
    _.each(horus.interfaces, (iface) => {
        iface.claim();
        _.each(iface.endpoints, (endpoint) => {
            if(endpoint.constructor.name === 'InEndpoint') {
                console.log('connecting usb interferface for inbound...');
                endpoint.startPoll();
                endpoint.on('data', (data) => {
                    console.log('inbound endpoint data', data);
                    // I should get some data here for events
                });
                endpoint.on('error', (err) => {
                    console.log('inbound endpoint error', err);
                });
            } else {
                console.log('connecting usb interferface for outbound...');
                endpoint.transfer([1, 2, 3, 4], (err) => {
                    console.log('outbound transfer error:', err);
                });
                endpoint.on('error', (err) => {
                    console.log('outbound endpoint error:', err);
                });
            }

        });
    });
}

function detachHorus() {
    if(horus) {
        _.each(horus.interfaces, (iface) => {
            _.each(iface.endpoints, (endpoint) => {
                console.log('stopPoll');
                endpoint.stopPoll();
            });
            iface.release();
        });
        horus.close();
        horus = undefined;
    }
}

usb.on('attach', (device) => {
    if(device.deviceDescriptor.idVendor === horusVendorId && device.deviceDescriptor.idProduct === horusProductId) {
        console.log('attached horus');
        attachDevice(device);
    }
});

usb.on('detach', (device) => {
    if(device.deviceDescriptor.idVendor === horusVendorId && device.deviceDescriptor.idProduct === horusProductId) {
        console.log('detached horus');
        detachHorus();
    }
});

// kick start horus
var device = usb.findByIds(horusVendorId, horusProductId);
if(device) {
    console.error('horus connected..');
    attachDevice(device);
} else {
    console.error('horus not found, please plug it in.');
}

// cleanup events
process.on('SIGTERM', function () { // ctrl c
    detachHorus();
    process.exit();
});

process.on('SIGINT', function () { // ctrl z
    detachHorus();
    process.exit();
});

process.on('uncaughtException', function (err) {
    // detachHorus();
    console.log('uncaughtException', err.stack);
});
