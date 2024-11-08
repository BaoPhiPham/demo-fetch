"use strict";
const baseURL = "https://provinces.open-api.vn/api";
// dùng bộ: class + promise + fetch
    // Tạo 1 tk chuyên request cới sever:
        class Http{
            // viết hàm get cho mọi api: district, provin,...
            // muốn lấy gì thì đưa đường dẫn cho t
            get(url){
                return fetch(url).then((response)=>{
                    if(response.ok){
                        return response.json();//Promise<data>
                    }else{
                        throw new Error(response.statusText)
                    }
                });
            };//=> ai gọi hàm get này sẽ nhận đc 1 lời hứa trả về <data> => Promise<data>
        }
    //
        class Store{
            constructor(){
                this.http = new Http();
            };
            getProvinces(){
                // get trả về Promise<Provinces>
                return this.http.get(`${baseURL}/p`);
            };
            getDistricts(provinceCode){
                return this.http
                .get(`${baseURL}/p/${provinceCode}/?depth=2`)
                .then((provinceInfor)=>{
                    return provinceInfor.districts;
                });//promise<districts>
            };
            getWards(districtCode){
                return this.http
                .get(`${baseURL}/d/${districtCode}/?depth=2`)
                .then((districtInfor)=>{
                    return districtInfor.wards;
                });//promise<Wards>
            };
        };
    //class chauws các hàm dùng render cho UI
        class RenderUI{
            renderProvinces(provinces){
                let htmlContent = provinces.map((provinceItem)=>{
                    const {name, code} = provinceItem;
                    return `<option value="${code}">${name}</option>`;
                }).join("");
                //nhét vào select ở id province
                document.querySelector("#province").innerHTML = htmlContent;
            };
            renderDistricts(districts){
                let htmlContent = districts.map((districtItem)=>{
                    const {name, code} = districtItem;
                    return `<option value="${code}">${name}</option>`;
                }).join("");
                //nhét vào select ở id province
                document.querySelector("#district").innerHTML = htmlContent;
            };
            renderWards(wards){
                let htmlContent = wards.map((wardItem)=>{
                    const {name, code} = wardItem;
                    return `<option value="${code}">${name}</option>`;
                }).join("");
                //nhét vào select ở id province
                document.querySelector("#ward").innerHTML = htmlContent;
            };
            renderInformation(information){
                const {address, ward, district, province} = information;
                //có thể dùng tk forin để làm
                const htmlContent = `${address}, ${ward}, ${district}, ${province}`;
                document.querySelector("#information").innerHTML = htmlContent;
            };
        };
// sự kiện trang web vừa load xong
    document.addEventListener("DOMContentLoaded", (event)=>{
        //sau trang web load xong, lên sever nhận dữ liệu 
            // => get danh sách các province và render lên giao diện
            const store = new Store();
            const ui = new RenderUI();
            store.getProvinces().then((provinces)=>{
                ui.renderProvinces(provinces);
                // Lấy province code ngay hiện tại
                const provinceCode = document.querySelector("#province").value;
                // dùng province Code để tìm danh sách cá district của nó:
                return store.getDistricts(provinceCode);
            }).then((districts)=>{
                ui.renderDistricts(districts);
                // lấy districtCode để tìm danh sách ward
                const districtCode = document.querySelector("#district").value;
                // dùng districtCode để tìm danh sách các ward của nó:
                return store.getWards(districtCode);
            }).then((wards)=>{
                ui.renderWards(wards);
            });  
            
    });   
//sự kiện thay đổi province:
    document.querySelector("#province").addEventListener("change", (value)=>{
        //lấy mã province hiện tại
        let provinceCode = document.querySelector("#province").value;
        let store = new Store();
        let ui = new RenderUI();
        store.getDistricts(provinceCode).
        then((districts)=>{
            ui.renderDistricts(districts);
            // lấy districtCode để tìm danh sách ward
            const districtCode = document.querySelector("#district").value;
            // dùng districtCode để tìm danh sách các ward của nó:
            return store.getWards(districtCode);
        }).then((wards)=>{
            ui.renderWards(wards);
        });
    }); 
//sự kiện thay đổi district:
    document.querySelector("#district").addEventListener("change", (value)=>{
        // Lấy district code hiện tại 
        let districtCode = document.querySelector("#district").value;
        let store = new Store();
        let ui = new RenderUI();
        store.getWards(districtCode).then((wards)=>{
            ui.renderWards(wards);
        })
    });
// sự kiện submit form(bấm nút đặt hàng)
    document.querySelector("form").addEventListener("submit", (event)=>{
        event.preventDefault();
        let province = document.querySelector("#province option:checked").innerHTML;
        let district = document.querySelector("#district option:checked").innerHTML;
        let ward = document.querySelector("#ward option:checked").innerHTML;
        let address = document.querySelector("#address").value;

        let ui = new RenderUI();
        let information = {
            address,
            ward,
            district,
            province
        }
        ui.renderInformation(information)
    });
