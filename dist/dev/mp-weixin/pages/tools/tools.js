"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "tools",
  setup(__props) {
    const clauseText = common_vendor.ref("");
    const isAnalyzing = common_vendor.ref(false);
    const analysisResult = common_vendor.ref("");
    const hasRisk = common_vendor.ref(false);
    const analyzeClause = () => {
      if (!clauseText.value.trim())
        return;
      isAnalyzing.value = true;
      analysisResult.value = "";
      setTimeout(() => {
        isAnalyzing.value = false;
        if (clauseText.value.includes("最终解释权") || clauseText.value.includes("概不负责")) {
          hasRisk.value = true;
          analysisResult.value = `
        <div style="font-size: 14px; color: #374151;">
          <p>检测到关键风险词：<span style="color: #ef4444; font-weight: bold;">"最终解释权" / "概不负责"</span></p>
          <p style="margin-top: 8px;"><b>法律解读：</b>根据《消费者权益保护法》，排除消费者主要权利的格式条款无效。商家单方规定"最终解释权"通常被认定为无效霸王条款。</p>
          <p style="margin-top: 8px; color: #2563eb;"><b>建议修改：</b>删除该表述，或并通过协商明确双方权利义务。</p>
        </div>
      `;
        } else {
          hasRisk.value = false;
          analysisResult.value = `
        <div style="font-size: 14px; color: #374151;">
          <p>未检测到明显的高风险关键词。</p>
          <p style="margin-top: 8px;"><b>可读性分析：</b>条款表述相对清晰。</p>
          <p style="margin-top: 8px; color: #059669;"><b>提示：</b>请继续关注其他关联条款，确保权利义务对等。</p>
        </div>
      `;
        }
      }, 1500);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: clauseText.value,
        b: common_vendor.o(($event) => clauseText.value = $event.detail.value),
        c: common_vendor.t(clauseText.value.length),
        d: !isAnalyzing.value
      }, !isAnalyzing.value ? {} : {}, {
        e: common_vendor.o(analyzeClause),
        f: isAnalyzing.value,
        g: analysisResult.value
      }, analysisResult.value ? common_vendor.e({
        h: hasRisk.value
      }, hasRisk.value ? {} : {}, {
        i: analysisResult.value
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4f238be9"], ["__file", "D:/xiangmu/智合云契微信小程序项目/src/pages/tools/tools.vue"]]);
wx.createPage(MiniProgramPage);
