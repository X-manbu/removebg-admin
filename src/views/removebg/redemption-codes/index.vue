<!-- 兑换码管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="批次号" prop="batchNo">
          <el-input
            v-model="queryParams.batchNo"
            placeholder="请输入批次号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="有效" value="active" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="兑换码" prop="code">
          <el-input
            v-model="queryParams.code"
            placeholder="模糊搜索兑换码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-section">
      <div class="table-section__toolbar">
        <div class="table-section__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenGenerateDialog">
            生成兑换码
          </el-button>
        </div>
        <div class="table-section__toolbar--tools">
          <el-button icon="download" @click="handleExportTable">导出</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        class="table-section__content"
      >
        <el-table-column label="ID" prop="id" width="70" align="center" />
        <el-table-column label="兑换码" prop="code" min-width="180" />
        <el-table-column label="批次号" prop="batch_no" min-width="140" />
        <el-table-column label="赠送点数" prop="points" width="100" align="center" />
        <el-table-column label="过期时间" prop="expires_at" width="180" align="center">
          <template #default="{ row }">
            {{ row.expires_at || "永不过期" }}
          </template>
        </el-table-column>
        <el-table-column label="最大使用次数" prop="max_uses" width="120" align="center" />
        <el-table-column label="已使用次数" prop="used_count" width="110" align="center" />
        <el-table-column label="状态" prop="status" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === "active" ? "有效" : "已禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="created_at" width="180" align="center" />
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 生成兑换码弹窗 -->
    <el-dialog
      v-model="generateDialog.visible"
      title="生成兑换码"
      width="500px"
      @close="handleCloseGenerateDialog"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateRules"
        label-width="120px"
      >
        <el-form-item label="生成数量" prop="count">
          <el-input-number
            v-model="generateForm.count"
            :min="1"
            :max="1000"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="赠送点数" prop="points">
          <el-input-number
            v-model="generateForm.points"
            :min="1"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="generateForm.batchNo" placeholder="可选，留空自动生成" />
        </el-form-item>

        <el-form-item label="有效期(天)" prop="expiresDays">
          <el-input-number
            v-model="generateForm.expiresDays"
            :min="1"
            :max="3650"
            controls-position="right"
            placeholder="可选"
          />
        </el-form-item>

        <el-form-item label="最大使用次数" prop="maxUses">
          <el-input-number
            v-model="generateForm.maxUses"
            :min="1"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCloseGenerateDialog">取消</el-button>
        <el-button type="primary" :loading="generateDialog.loading" @click="handleGenerate">
          生成
        </el-button>
      </template>
    </el-dialog>

    <!-- 生成结果弹窗 -->
    <el-dialog v-model="resultDialog.visible" title="生成结果" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="批次号">{{ resultDialog.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="生成数量">
          {{ resultDialog.codes.length }}
        </el-descriptions-item>
      </el-descriptions>

      <el-input
        v-model="resultDialog.codesText"
        type="textarea"
        :rows="10"
        readonly
        style="margin-top: 16px"
      />

      <template #footer>
        <el-button @click="resultDialog.visible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportCodes">导出为 TXT</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import type {
  RedemptionCodeItem,
  RedemptionCodeQueryParams,
  GenerateCodesParams,
} from "@/types/api";
import RemovebgAdminAPI from "@/api/removebg";

defineOptions({
  name: "RedemptionCodes",
  inheritAttrs: false,
});

const queryFormRef = ref();
const generateFormRef = ref();

const loading = ref(false);
const tableData = ref<RedemptionCodeItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const queryParams = reactive<RedemptionCodeQueryParams>({
  batchNo: undefined,
  status: undefined,
  code: undefined,
});

// 生成弹窗
const generateDialog = reactive({
  visible: false,
  loading: false,
});

const generateForm = reactive<GenerateCodesParams>({
  count: 10,
  points: 10,
  batchNo: undefined,
  expiresDays: 30,
  maxUses: 1,
});

const generateRules = reactive({
  count: [{ required: true, message: "请输入生成数量", trigger: "blur" }],
  points: [{ required: true, message: "请输入赠送点数", trigger: "blur" }],
});

// 结果弹窗
const resultDialog = reactive({
  visible: false,
  codes: [] as string[],
  codesText: "",
  batchNo: "",
});

async function fetchData() {
  loading.value = true;
  try {
    const params: RedemptionCodeQueryParams = {
      ...queryParams,
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
    };
    const res = await RemovebgAdminAPI.getRedemptionCodes(params);
    tableData.value = res.codes;
    total.value = res.total;
  } catch (error) {
    console.error("获取兑换码列表失败:", error);
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  currentPage.value = 1;
  fetchData();
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  currentPage.value = 1;
  fetchData();
}

function handleOpenGenerateDialog() {
  generateDialog.visible = true;
}

function handleCloseGenerateDialog() {
  generateDialog.visible = false;
  generateFormRef.value?.resetFields();
  Object.assign(generateForm, {
    count: 10,
    points: 10,
    batchNo: undefined,
    expiresDays: 30,
    maxUses: 1,
  });
}

const handleGenerate = useDebounceFn(async () => {
  const valid = await generateFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  generateDialog.loading = true;
  try {
    const res = await RemovebgAdminAPI.generateCodes({ ...generateForm });
    ElMessage.success(`成功生成 ${res.count} 个兑换码`);
    handleCloseGenerateDialog();

    // 展示结果
    resultDialog.codes = res.codes;
    resultDialog.codesText = res.codes.join("\n");
    resultDialog.batchNo = res.batchNo;
    resultDialog.visible = true;

    // 刷新列表
    handleQuery();
  } catch (error) {
    console.error("生成兑换码失败:", error);
  } finally {
    generateDialog.loading = false;
  }
}, 300);

function handleExportCodes() {
  const blob = new Blob([resultDialog.codesText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `兑换码_${resultDialog.batchNo}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleExportTable() {
  const header = [
    "ID",
    "兑换码",
    "批次号",
    "赠送点数",
    "过期时间",
    "最大使用次数",
    "已使用次数",
    "状态",
    "创建时间",
  ];
  const rows = tableData.value.map((item) => [
    item.id,
    item.code,
    item.batch_no,
    item.points,
    item.expires_at || "永不过期",
    item.max_uses,
    item.used_count,
    item.status,
    item.created_at,
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `兑换码列表.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  fetchData();
});
</script>
