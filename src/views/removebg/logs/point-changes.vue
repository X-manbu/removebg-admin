<!-- 点数变更日志 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model.number="queryParams.userId"
            placeholder="请输入用户ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="变动原因" prop="reason">
          <el-select v-model="queryParams.reason" placeholder="全部" clearable style="width: 150px">
            <el-option label="初始赠送" value="initial" />
            <el-option label="抠图消耗" value="matting" />
            <el-option label="兑换码兑换" value="redemption" />
            <el-option label="管理员调整" value="admin_adjust" />
          </el-select>
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
          <el-button type="primary" icon="edit" @click="handleOpenAdjustDialog">
            调整用户点数
          </el-button>
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
        <el-table-column label="用户ID" prop="user_id" width="90" align="center" />
        <el-table-column label="变动数量" prop="amount" width="110" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.amount >= 0 ? '#67c23a' : '#f56c6c' }">
              {{ row.amount >= 0 ? "+" : "" }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动后余额" prop="balance_after" width="120" align="center" />
        <el-table-column label="原因" prop="reason" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="reasonTagType(row.reason)">
              {{ reasonLabel(row.reason) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联ID" prop="related_id" width="90" align="center">
          <template #default="{ row }">
            {{ row.related_id ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="created_at" min-width="180" align="center" />
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 调整用户点数弹窗 -->
    <el-dialog
      v-model="adjustDialog.visible"
      title="调整用户点数"
      width="500px"
      @close="handleCloseAdjustDialog"
    >
      <el-form ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number
            v-model="adjustForm.userId"
            :min="1"
            controls-position="right"
            placeholder="请输入用户ID"
          />
        </el-form-item>

        <el-form-item label="设置点数" prop="amount">
          <el-input-number
            v-model="adjustForm.amount"
            controls-position="right"
            placeholder="请输入点数"
          />
        </el-form-item>

        <el-form-item label="原因" prop="reason">
          <el-input v-model="adjustForm.reason" placeholder="可选，如：活动补偿" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCloseAdjustDialog">取消</el-button>
        <el-button type="primary" :loading="adjustDialog.loading" @click="handleAdjust">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import type { PointChangeLogItem, PointChangeLogQueryParams } from "@/types/api";
import RemovebgAdminAPI from "@/api/removebg";

defineOptions({
  name: "PointChangeLogs",
  inheritAttrs: false,
});

const queryFormRef = ref();
const adjustFormRef = ref();

const loading = ref(false);
const tableData = ref<PointChangeLogItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const queryParams = reactive<PointChangeLogQueryParams>({
  userId: undefined,
  reason: undefined,
});

// 调整弹窗
const adjustDialog = reactive({
  visible: false,
  loading: false,
});

const adjustForm = reactive({
  userId: undefined as number | undefined,
  amount: 0,
  reason: "",
});

const adjustRules = reactive({
  userId: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
  amount: [{ required: true, message: "请输入点数", trigger: "blur" }],
});

const reasonMap: Record<string, string> = {
  initial: "初始赠送",
  matting: "抠图消耗",
  redemption: "兑换码兑换",
  admin_adjust: "管理员调整",
};

function reasonLabel(reason: string): string {
  return reasonMap[reason] || reason;
}

function reasonTagType(reason: string) {
  const map: Record<string, "success" | "warning" | "primary" | "danger" | "info"> = {
    initial: "success",
    matting: "warning",
    redemption: "primary",
    admin_adjust: "danger",
  };
  return map[reason] || "info";
}

async function fetchData() {
  loading.value = true;
  try {
    const params: PointChangeLogQueryParams = {
      ...queryParams,
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
    };
    const res = await RemovebgAdminAPI.getPointChangeLogs(params);
    console.log("获取点数变更日志成功:", res);
    tableData.value = res.logs;
    total.value = res.total;
  } catch (error) {
    console.error("获取点数变更日志失败:", error);
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

function handleOpenAdjustDialog() {
  adjustDialog.visible = true;
}

function handleCloseAdjustDialog() {
  adjustDialog.visible = false;
  adjustFormRef.value?.resetFields();
  Object.assign(adjustForm, { userId: undefined, amount: 0, reason: "" });
}

const handleAdjust = useDebounceFn(async () => {
  const valid = await adjustFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  try {
    await ElMessageBox.confirm(
      `确认将用户 ${adjustForm.userId} 的点数设置为 ${adjustForm.amount}？`,
      "确认操作",
      { type: "warning" }
    );
  } catch {
    return;
  }

  adjustDialog.loading = true;
  try {
    await RemovebgAdminAPI.adjustUserPoints(adjustForm.userId!, {
      amount: adjustForm.amount,
      reason: adjustForm.reason || undefined,
    });
    ElMessage.success("点数调整成功");
    handleCloseAdjustDialog();
    handleQuery();
  } catch (error) {
    console.error("调整点数失败:", error);
  } finally {
    adjustDialog.loading = false;
  }
}, 300);

onMounted(() => {
  fetchData();
});
</script>
