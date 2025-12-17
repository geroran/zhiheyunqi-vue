"use strict";
const common_vendor = require("../../common/vendor.js");
const mock_index = require("../../mock/index.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const articles = common_vendor.ref(mock_index.encyclopedia);
    const templatesData = common_vendor.ref(mock_index.templates);
    const categories = [
      { name: "百科", icon: "📖", color: "#e0f2fe" },
      { name: "避坑", icon: "🛡️", color: "#fef3c7" },
      { name: "模板", icon: "📝", color: "#dcfce7" },
      { name: "术语", icon: "🔤", color: "#f3e8ff" }
    ];
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(categories, (item, index, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: item.color,
            c: common_vendor.t(item.name),
            d: index
          };
        }),
        b: common_vendor.f(articles.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.desc),
            c: common_vendor.f(item.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            d: item.id
          };
        }),
        c: common_vendor.f(templatesData.value, (tpl, k0, i0) => {
          return {
            a: common_vendor.t(tpl.title),
            b: common_vendor.t(tpl.desc),
            c: tpl.id
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"], ["__file", "D:/xiangmu/智合云契微信小程序项目/src/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
