"use strict";
const common_vendor = require("../../common/vendor.js");
const mock_index = require("../../mock/index.js");
const _sfc_main = {
  __name: "practice",
  setup(__props) {
    const scenariosData = common_vendor.ref(mock_index.scenarios);
    const activeScenario = common_vendor.ref(null);
    const selectedOption = common_vendor.ref(null);
    const hasAnswered = common_vendor.ref(false);
    const startScenario = (item) => {
      activeScenario.value = item;
      selectedOption.value = null;
      hasAnswered.value = false;
    };
    const selectOption = (idx) => {
      if (hasAnswered.value)
        return;
      selectedOption.value = idx;
      hasAnswered.value = true;
    };
    const isCorrect = common_vendor.computed(() => {
      if (selectedOption.value === null)
        return false;
      return activeScenario.value.options[selectedOption.value].isCorrect;
    });
    const currentFeedback = common_vendor.computed(() => {
      if (selectedOption.value === null)
        return "";
      return activeScenario.value.options[selectedOption.value].feedback;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !activeScenario.value
      }, !activeScenario.value ? {
        b: common_vendor.f(scenariosData.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.id <= 1 ? "新手" : "进阶"),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.desc),
            d: item.id,
            e: common_vendor.o(($event) => startScenario(item), item.id)
          };
        })
      } : common_vendor.e({
        c: common_vendor.o(($event) => activeScenario.value = null),
        d: common_vendor.t(activeScenario.value.title),
        e: common_vendor.t(activeScenario.value.desc),
        f: common_vendor.f(activeScenario.value.options, (opt, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(opt.text),
            b: hasAnswered.value && opt.isCorrect
          }, hasAnswered.value && opt.isCorrect ? {} : {}, {
            c: hasAnswered.value && selectedOption.value === idx && !opt.isCorrect
          }, hasAnswered.value && selectedOption.value === idx && !opt.isCorrect ? {} : {}, {
            d: idx,
            e: selectedOption.value === idx ? 1 : "",
            f: hasAnswered.value && opt.isCorrect ? 1 : "",
            g: hasAnswered.value && selectedOption.value === idx && !opt.isCorrect ? 1 : "",
            h: common_vendor.o(($event) => selectOption(idx), idx)
          });
        }),
        g: hasAnswered.value
      }, hasAnswered.value ? {
        h: common_vendor.t(common_vendor.unref(isCorrect) ? "回答正确！🎉" : "回答错误 😟"),
        i: common_vendor.t(common_vendor.unref(currentFeedback)),
        j: common_vendor.o(($event) => activeScenario.value = null)
      } : {}));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ec16e816"], ["__file", "D:/xiangmu/智合云契微信小程序项目/src/pages/practice/practice.vue"]]);
wx.createPage(MiniProgramPage);
