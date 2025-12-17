"use strict";
const common_vendor = require("../../common/vendor.js");
const mock_index = require("../../mock/index.js");
const _sfc_main = {
  __name: "profile",
  setup(__props) {
    const skills = common_vendor.ref(mock_index.userStats.radar.categories.map((cat, index) => {
      return {
        name: cat,
        score: mock_index.userStats.radar.series[0].data[index]
      };
    }));
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(mock_index.userStats).days),
        b: common_vendor.t(common_vendor.unref(mock_index.userStats).articles),
        c: common_vendor.t(common_vendor.unref(mock_index.userStats).quizScore),
        d: common_vendor.f(skills.value, (val, idx, i0) => {
          return {
            a: common_vendor.t(val.name),
            b: common_vendor.t(val.score),
            c: val.score + "%",
            d: idx
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04d37cba"], ["__file", "D:/xiangmu/智合云契微信小程序项目/src/pages/profile/profile.vue"]]);
wx.createPage(MiniProgramPage);
