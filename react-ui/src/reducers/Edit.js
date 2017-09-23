import { blogID, loginData, signUpData, addressData, paymentData, messageData, galleryData, localGuideData, editData, homeData, emailData } from '../../../data/data';

const hash = {
  "Login": loginData,
  "Login Again": loginData,
  "Sign Up": signUpData,
  "Send Message": messageData,
  "Edit Content": editData,
  "Add Room": galleryData,
  "Edit Room": galleryData,
  "Edit Guide": localGuideData,
  "Edit Home": homeData,
  "Add Guide": localGuideData,
  "Update Credit": paymentData,
  "Update Billing": addressData,
  "Update Email": emailData
};

const Edit = function(title){
  const path = window.location.pathname;
  let location = path.split('/').filter((p) => { return p !== ''; });
  if(location.length === 0) location.push('home');

  this.message = '';
  this.location = location;
  this.url = '';
  this.next = (!path.includes("confirm")) ? '#' : "/welcome";
  this.modalTitle = title;
  this.dataObj = {};
}

Edit.prototype = {
  setDataObj: function(dataObj){
    //const names = ["Send Reminder", "Check-In", "Charge Client", "Delete Reservation" ];
    if(Array.isArray(dataObj)){
      this.dataObj = {reservations: dataObj};
    }
    else if(this.modalTitle.includes("Confirm") || this.modalTitle.includes("Logout")){
      this.dataObj = {message: "confirm"};
    }
    else if(!this.modalTitle.includes("Delete") && !this.modalTitle.includes("Cart")){
      const A = ["Add Room", "Add Guide", "Sign Up", "Login", "Update Credit"];
      const defaultContent = A.includes(this.modalTitle.trim());

      if(this.modalTitle.includes("Billing") || this.modalTitle.includes("Email")){ //when editing user info
        const arr = dataObj.split('/');
        let i = 0;

        this.dataObj = (Object.keys(hash[this.modalTitle.trim()])).reduce((newObj, k) => {
          if(k === "Send Me Text Confirmation") newObj[k] = true;
          else newObj[k] = arr[i];
          i++;
          return newObj;
        }, {});
      }
      else { //everything else
        this.dataObj = (Object.keys(hash[this.modalTitle.trim()])).reduce((newObj, k) => {
          if(defaultContent && k === "admin") newObj[k] = false;
          else if(defaultContent) newObj[k] = (hash[this.modalTitle.trim()][k]["default"] || '');
          else newObj[k] = dataObj[k] || hash[this.modalTitle.trim()][k]["default"];
          return newObj;
        }, {});
      }

    }
    else{
      this.dataObj = dataObj;
    }
  },

  setURL: function(token, id, admin){
    console.log("location", this.location[0]);
    const title = this.modalTitle;
    const space = title.indexOf(' ') + 1;

    let url = "";
    if(title.includes("Send Message")) url = "/sayHello";
    if(title.includes("Login")) url = "/login";
    if(title.includes("Sign Up")) url = "/user";
    if(title.includes("Room")) url = "/room";
    if(title.includes("Guide")) url = "/guide";

    if(title.includes("Delete Reservation")) url = `/cancel/${id}`;
    if(title.includes("Charge")) url = `/charge/${id}`;
    if(title.includes("Check-In")) url = `/checkIn/${id}`;
    if(title.includes("Reminder")) url = `/reminder/${id}`;

    if(title.includes("Confirm") && admin) url = `/res/page/${blogID}/${id}`;
    if(title.includes("Confirm") && !admin) url = `/res/user/${id}`;
    if(title.includes("Update") && admin) url = `/user/page/${blogID}/${id}/${title.toLowerCase().slice(space)}`;
    if(title.includes("Update") && !admin) url = `/user/user/${id}/${title.toLowerCase().slice(space)}`;
    if(title.includes("Edit Content") || title.includes("Edit Home")) url = `/${this.location[0]}`;
    if(title.includes("Remove") && admin) url = `/user/page/${blogID}/${id}/cart`;
    if(title.includes("Remove") && !admin) url = `/user/user/${id}/cart`;
    if(title.includes("Add to Cart") && !token) url = "/res/available/";
    if(title.includes("Add to Cart") && token && id && !admin) url = `/res/available/user/${id}`; //user
    if(title.includes("Add to Cart") && token && !id && admin) url = `/res/available/page/${blogID}`; //admin without user
    if(title.includes("Add to Cart") && token && id && admin) url = `/res/available/page/${blogID}/${id}`; //admin with user
    if((title.includes("Room") || title.includes("Guide")) && (title.includes("Edit") || title.includes("Delete"))) url += `/${id}`;

    if(title.includes("Delete Reservation") || title.includes("Send Reminder") || title.includes("Check-In") || title.includes("Charge")) url = `/res/page/${blogID}${url}`;
    else if((title.includes("Edit") || title.includes("Add") || title.includes("Delete")) && !title.includes("Add to Cart")) url = `/page/${blogID}${url}`;
    //if(title.includes("Reservation")) url = "/res" + url;

    if(title === "Logout") this.url = "/auth/logout"
    else if(token) this.url = `${url}?token=${token}`;
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
