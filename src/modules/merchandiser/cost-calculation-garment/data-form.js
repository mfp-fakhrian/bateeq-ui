import { Router } from "aurelia-router";
import { inject, bindable, computedFrom } from "aurelia-framework";
import { Service } from "./services/service";
import { EfficiencyService } from "./services/efficiency-service";
import { RateService } from "./services/rate-service";
import numeral from "numeral";
numeral.defaultFormat("0,0.00");
const rateNumberFormat = "0,0.000";
const lineLoader = require("../../../loader/line-loader");
const sizeRangeLoader = require("../../../loader/size-range-loader");
const buyerLoader = require("../../../loader/buyer-loader");

@inject(Router, Service, EfficiencyService, RateService)
export class DataForm {
  @bindable title;
  @bindable readOnly = true;
  @bindable disabled = true;
  @bindable data = {};
  @bindable error = {};
  defaultRate = { Id: 0, Value: 0, CalculatedValue: 0 };
  length0 = {
    label: {
      align: "left"
    }
  };
  length4 = {
    label: {
      align: "left",
      length: 4
    }
  };
  length6 = {
    label: {
      align: "left",
      length: 6
    }
  };
  length8 = {
    label: {
      align: "left",
      length: 8
    }
  };
  costCalculationGarment_MaterialsInfo = {
    columns: [
      { header: "Kategori", value: "Category" },
      { header: "Material", value: "Material" },
      { header: "Deskripsi", value: "Description" },
      { header: "Kuantitas", value: "Quantity" },
      { header: "Satuan", value: "SatuanQuantity" },
      { header: "Price", value: "Price" },
      { header: "Satuan", value: "SatuanPrice" },
      { header: "Konversi", value: "Conversion" },
      { header: "Total", value: "Total" },
      { header: "Ongkir (%)", value: "ShippingFeePortion" },
      { header: "Jumlah Ongkir", value: "TotalShippingFee" },
      { header: "Kuantitas Budget", value: "BudgetQuantity" }
    ],
    onAdd: function() {
      this.data.CostCalculationGarment_Materials.push({
        QuantityOrder: this.data.Quantity,
        FabricAllowance: this.data.FabricAllowance,
        AccessoriesAllowance: this.data.AccessoriesAllowance,
        Rate: this.data.Rate
      });
      console.log(this.data.CostCalculationGarment_Materials);
    }.bind(this),
    onRemove: function () {
      console.log("Material removed")
    }.bind(this)
  };
  radio = {
    Dollar: "Dollar",
    Rupiah: "Rupiah"
  };

  constructor(router, service, efficiencyService, rateService) {
    this.router = router;
    this.service = service;
    this.efficiencyService = efficiencyService;
    this.rateService = rateService;
  }

  @bindable imageUpload;
  @bindable imageSrc;
  imageUploadChanged(newValue) {
    let imageInput = document.getElementById("imageInput");
    let reader = new FileReader();
    reader.onload = event => {
      let base64Image = event.target.result;
      this.imageSrc = this.data.ImageFile = base64Image;
    };
    reader.readAsDataURL(imageInput.files[0]);
  }

  @bindable selectedRate;
  selectedRateChanged(newValue) {
    if (newValue.toUpperCase() === "RUPIAH") {
      this.data.Rate = { Id: 0, Value: 1, CalculatedValue: 1 };
    } else {
      this.data.Rate = this.RateDollar;
    }
  }

  @computedFrom("data.Id")
  get isEdit() {
    return (this.data.Id || 0) != 0;
  }

  @computedFrom("error.CostCalculationGarment_MaterialTable")
  get hasError() {
    return (
      (this.error.CostCalculationGarment_MaterialTable
        ? this.error.CostCalculationGarment_MaterialTable.length
        : 0) > 0
    );
  }

  async bind(context) {
    this.context = context;
    this.data = this.context.data;
    this.error = this.context.error;
    this.data.SMV_Cutting = this.data.SMV_Cutting ? this.data.SMV_Cutting : 0;
    this.data.SMV_Sewing = this.data.SMV_Sewing ? this.data.SMV_Sewing : 0;
    this.data.SMV_Finishing = this.data.SMV_Finishing
      ? this.data.SMV_Finishing
      : 0;
    this.quantity = this.data.Quantity ? this.data.Quantity : 1;
    this.fabricAllowance = this.data.FabricAllowance
      ? this.data.FabricAllowance
      : 0;
    this.accessoriesAllowance = this.data.AccessoriesAllowance
      ? this.data.AccessoriesAllowance
      : 0;
    this.data.Risk = this.data.Risk ? this.data.Risk : 5;
    this.imageSrc = this.data.ImageFile;

    let promises = [];

    let wage;
    if (this.data.Wage) {
      wage = new Promise((resolve, reject) => {
        resolve(this.data.Wage);
      });
    } else {
      this.data.Wage = this.defaultRate;
      wage = this.rateService.search({ keyword: "OL" }).then(results => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        result.Value = numeral(
          numeral(result.Value).format(rateNumberFormat)
        ).value();
        return result;
      });
    }
    promises.push(wage);

    let THR;
    if (this.data.THR) {
      THR = new Promise((resolve, reject) => {
        resolve(this.data.THR);
      });
    } else {
      this.data.THR = this.defaultRate;
      THR = this.rateService.search({ keyword: "THR" }).then(results => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        result.Value = numeral(
          numeral(result.Value).format(rateNumberFormat)
        ).value();
        return result;
      });
    }
    promises.push(THR);

    let rate;
    if (this.data.Rate) {
      rate = new Promise((resolve, reject) => {
        resolve(this.data.Rate);
      });
    } else {
      this.data.Rate = this.defaultRate;
      rate = this.rateService.search({ keyword: "USD" }).then(results => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        result.Value = numeral(
          numeral(result.Value).format(rateNumberFormat)
        ).value();
        return result;
      });
    }
    promises.push(rate);

    let OTL1;
    if (this.data.OTL1) {
      OTL1 = new Promise((resolve, reject) => {
        resolve(this.data.OTL1);
      });
    } else {
      this.data.OTL1 = this.defaultRate;
      OTL1 = this.rateService.search({ keyword: "OTL 1" }).then(results => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        return result;
      });
    }
    promises.push(OTL1);

    let OTL2;
    if (this.data.OTL2) {
      OTL2 = new Promise((resolve, reject) => {
        resolve(this.data.OTL2);
      });
    } else {
      this.data.OTL2 = this.defaultRate;
      OTL2 = this.rateService.search({ keyword: "OTL 2" }).then(results => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        return result;
      });
    }
    promises.push(OTL2);

    let all = await Promise.all(promises);
    this.data.Wage = all[0];
    this.data.THR = all[1];
    this.RateDollar = all[2];
    this.data.OTL1 = all[3];
    this.data.OTL2 = all[4];
    this.selectedRate = this.data.Rate ? this.radio.Dollar : this.radio.Rupiah;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.QuantityOrder = this.data.Quantity;
        item.FabricAllowance = this.data.FabricAllowance;
        item.AccessoriesAllowance = this.data.AccessoriesAllowance;
        item.Rate = this.data.Rate;
      });
    }
  }

  get lineLoader() {
    return lineLoader;
  }

  get sizeRangeLoader() {
    return sizeRangeLoader;
  }

  get buyerLoader() {
    return buyerLoader;
  }

  @bindable quantity;
  async quantityChanged(newValue) {
    this.data.Quantity = newValue;
    this.data.Efficiency = await this.efficiencyService.getEffByQty(
      this.data.Quantity
    );
    let index = this.data.Efficiency.Value
      ? 100 / this.data.Efficiency.Value
      : 0;
    this.data.Index = numeral(numeral(index).format()).value();
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.QuantityOrder = this.data.Quantity;
      });
    }
  }

  @bindable fabricAllowance;
  fabricAllowanceChanged(newValue) {
    this.data.FabricAllowance = newValue;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.FabricAllowance = this.data.FabricAllowance;
      });
    }
  }

  @bindable accessoriesAllowance;
  accessoriesAllowanceChanged(newValue) {
    this.data.AccessoriesAllowance = newValue;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.AccessoriesAllowance = this.data.AccessoriesAllowance;
      });
    }
  }

  @computedFrom("data.SMV_Cutting", "data.SMV_Sewing", "data.SMV_Finishing")
  get SMV_Total() {
    let SMV_Total =
      this.data.SMV_Cutting + this.data.SMV_Sewing + this.data.SMV_Finishing;
    SMV_Total = numeral(SMV_Total).format();
    this.data.SMV_Total = numeral(SMV_Total).value();
    return SMV_Total;
  }

  @computedFrom(
    "data.CommissionPortion",
    "data.ConfirmPrice",
    "data.Freight",
    "data.Insurance",
    "data.Rate"
  )
  get commissionRate() {
    let CommissionRate =
      this.data.CommissionPortion /
      100 *
      (this.data.ConfirmPrice - this.data.Insurance - this.data.Freight) *
      this.data.Rate.Value;
    CommissionRate = numeral(CommissionRate).format();
    this.data.CommissionRate = numeral(CommissionRate).value();
    return CommissionRate;
  }

  @computedFrom("data.OTL1", "data.SMV_Total")
  get calculatedRateOTL1() {
    let calculatedRateOTL1 = this.data.SMV_Total
      ? this.data.OTL1.Value * this.data.SMV_Total * 60
      : 0;
    calculatedRateOTL1 = numeral(calculatedRateOTL1).format();
    this.data.OTL1.CalculatedValue = numeral(calculatedRateOTL1).value();
    return calculatedRateOTL1;
  }

  @computedFrom("data.OTL2", "data.SMV_Total")
  get calculatedRateOTL2() {
    let calculatedRateOTL2 = this.data.SMV_Total
      ? this.data.OTL2.Value * this.data.SMV_Total * 60
      : 0;
    calculatedRateOTL2 = numeral(calculatedRateOTL2).format();
    this.data.OTL2.CalculatedValue = numeral(calculatedRateOTL2).value();
    return calculatedRateOTL2;
  }

  @computedFrom(
    "data.Wage",
    "data.SMV_Sewing",
    "data.Efficiency" + "data.SMV_Cutting",
    "data.SMV_Finishing",
    "data.THR",
    "data.SMV_Total"
  )
  get productionCost() {
    let productionCost = this.data.Efficiency
      ? this.data.Efficiency.Value
        ? this.data.Wage.Value *
            this.data.SMV_Sewing *
            100 /
            this.data.Efficiency.Value +
          this.data.Wage.Value * this.data.SMV_Cutting * 100 / 75 +
          this.data.Wage.Value * this.data.SMV_Finishing * 100 / 90 +
          this.data.THR.Value * this.data.SMV_Total
        : 0
      : 0;
    productionCost = numeral(productionCost).format();
    this.data.ProductionCost = numeral(productionCost).value();
    return productionCost;
  }

  @computedFrom("data.ConfirmPrice", "data.Rate", "data.CommissionRate")
  get NETFOB() {
    let NETFOB =
      this.data.ConfirmPrice * this.data.Rate.Value - this.data.CommissionRate;
    NETFOB = numeral(NETFOB).format();
    this.data.NETFOB = numeral(NETFOB).value();
    return NETFOB;
  }

  get freightCost() {
    let freightCost = 0;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        freightCost += item.TotalShippingFee;
      });
    }
    freightCost = numeral(freightCost).format();
    this.data.FreightCost = numeral(freightCost).value();
    return freightCost;
  }

  get NETFOBP() {
    let allMaterialCost = 0;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        allMaterialCost += item.Total;
      });
    }
    let subTotal =
      allMaterialCost !== 0
        ? (allMaterialCost +
            this.data.ProductionCost +
            this.data.OTL1.CalculatedValue +
            this.data.OTL2.CalculatedValue) *
            (100 + this.data.Risk) /
            100 +
          this.data.FreightCost
        : 0;
    let NETFOBP =
      this.data.NETFOB && subTotal !== 0
        ? (this.data.NETFOB - subTotal) / subTotal * 100
        : 0;
    NETFOBP = numeral(NETFOBP).format();
    this.data.NETFOBP = numeral(NETFOBP).value();
    return NETFOBP;
  }
}
