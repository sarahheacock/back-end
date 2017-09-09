import { blogID, loginData, initial, signUpData, addressData, paymentData, messageData, galleryData, localGuideData, editData, homeData } from '../../../data/data';

const hash = {
  "Login": loginData,
  "Sign Up": signUpData,
  "Send Message": messageData,
  "Edit Content": editData,
  "Add Room": galleryData,
  "Edit Room": galleryData,
  "Edit Guide": localGuideData,
  "Edit Home": homeData,
  "Add Guide": localGuideData,
};

const Edit = function(title){
  const path = window.location.pathname;
  let location = path.split('/').filter((p) => { return p !== ''; });
  if(location.length === 0) location.push('home');

  this.message = '';
  this.location = location;
  this.url = '';
  this.next = '#';
  this.modalTitle = title;
  this.dataObj = {};
}

Edit.prototype = {
  setDataObj: function(dataObj){
    if(!this.modalTitle.includes("Delete")){
      let newObj = {};
      const A = ["Add Room", "Add Guide", "Sign Up", "Send Message", "Login"];
      const defaultContent = A.includes(this.modalTitle.trim());

      Object.keys(hash[this.modalTitle.trim()]).forEach((k) => {
        if(defaultContent) newObj[k] = (k === "admin") ? hash[this.modalTitle.trim()][k]["default"] : hash[this.modalTitle.trim()][k]["default"] || '';
        else newObj[k] = dataObj[k] || hash[this.modalTitle.trim()][k]["default"];
      });

      this.dataObj = newObj;
    }
    else{
      this.dataObj = dataObj;
    }
  },

  setURL: function(token, id){
    console.log("location", this.location[0]);
    const title = this.modalTitle;
    let url = "";
    if(title.includes("Send Message")) url = "/sayHello";
    if(title.includes("Login")) url = "/login";
    if(title.includes("Sign Up")) url = "/user";
    if(title.includes("Room")) url = "/room";
    if(title.includes("Guide")) url = "/guide";
    if(title.includes("Reservation")) url = "/cancel";
    if(title.includes("Edit Content") || title.includes("Edit Home")) url = `/${this.location[0]}`;
    if((title.includes("Room") || title.includes("Guide")) && (title.includes("Edit") || title.includes("Delete"))) url += `/${id}`;

    if(title.includes("Edit") || title.includes("Add") || title.includes("Delete")) url = `/page/${blogID}${url}?token=${token}`;
    if(title === "Delete Reservation") url = "/res" + url;

    this.url = url;
  },

  getEdit: function(){
    return {
      message: this.message,
      edit: {
        url: this.url,
        modalTitle: this.modalTitle,
        next: this.next,
        dataObj: this.dataObj
      }
    };
  }
};

export default Edit;
