<!-- 兑换记录日志 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="兑换码ID" prop="codeId">
          <el-input
            v-model.number="queryParams.codeId"
            placeholder="请输入兑换码ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model.number="queryParams.userId"
            placeholder="请输入用户ID"
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
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-avatar :size="28" :src="row.avatar_url" />
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="获得点数" prop="points" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #67c23a">+{{ row.points }}</span>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" prop="ip_address" width="140" align="center" />
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
  </div>
</template>

<script setup lang="ts">
import type { RedemptionLogItem, RedemptionLogQueryParams } from "@/types/api";
import RemovebgAdminAPI from "@/api/removebg";

defineOptions({
  name: "RedemptionLogs",
  inheritAttrs: false,
});

const queryFormRef = ref();

const loading = ref(false);
const tableData = ref<RedemptionLogItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const queryParams = reactive<RedemptionLogQueryParams>({
  codeId: undefined,
  userId: undefined,
});

async function fetchData() {
  loading.value = true;
  try {
    const params: RedemptionLogQueryParams = {
      ...queryParams,
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
    };
    const res = await RemovebgAdminAPI.getRedemptionLogs(params);
    tableData.value = res.logs;
    total.value = res.total;
  } catch (error) {
    console.error("获取兑换记录失败:", error);
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

onMounted(() => {
  fetchData();
});
</script>
