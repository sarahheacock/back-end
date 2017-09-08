import { blogID, loginData, initial, signUpData, addressData, paymentData, messageData, galleryData, localGuideData, editData, homeData } from '../../../../data/data';

const hash = {
  "Login": loginData,
  "Sign Up": signUpData,
  "Send Message": messageData,
  "Edit Content": editData,
  "Delete Room": {"_id": ''},
  "Delete Guide": {"_id": ''},
  "Add Room": galleryData,
  "Edit Room": galleryData,
  "Edit Guide": localGuideData,
  "Edit Home": homeData,
  "Add Guide": localGuideData,
};

const Edit = function(title){
  this.style = (title.includes("Edit")) ?
    "button orangeButton":
    ((title.includes("Add") || title.includes("Login")) ?
      "button blueButton":
      ((title.includes("Delete")) ?
        "button redButton":
        "button"));
  this.message = '';
  this.url = '';
  this.next = '#';
  this.modalTitle = title;
  this.dataObj = {};
}

Edit.prototype = {
  setDataObj: function(location, dataObj){
    let newObj = {};
    const A = ["Add Content", "Sign Up", "Send Message", "Login"];
    const defaultContent = A.includes(this.modalTitle.trim());

    Object.keys(hash[this.modalTitle.trim()]).forEach((k) => {
      if(defaultContent) newObj[k] = hash[this.modalTitle.trim()][k]["default"] || '';
      else newObj[k] = dataObj[k] || hash[this.modalTitle.trim()][k]["default"];
    });

    this.dataObj = newObj;
  },

  setURL: function(token, id, location){
    const title = this.modalTitle;
    let url = "";
    if(title.includes("Send Message")) url = "/sayHello";
    if(title.includes("Login")) url = "/login";
    if(title.includes("Sign Up")) url = "/user";
    if(title.includes("Add Room")) url = "/room";
    if(title.includes("Add Guide")) url = "/guide";
    if(title.includes("Edit Content")) url = `/${(location[0]) ? location[0] : "home"}`;
    if(title.includes("Edit Room")) url = `/room/${id}`;
    if(title.includes("Edit Guide")) url = `/guide/${id}`;
    if(title.includes("Delete Room")) url = `/room/${id}`;
    if(title.includes("Delete Guide")) url = `/guide/${id}`;

    if(title.includes("Edit") || title.includes("Add") || title.includes("Delete")) this.url = `/page/${blogID}${url}?token=${token}`;
    else this.url = url;
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
