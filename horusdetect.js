var usb = require('usb');

usb.on('attach', (device) => {
    console.log('attached', device);
});

usb.on('detach', (device) => {
    console.log('detach', device);
});
