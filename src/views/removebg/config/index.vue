<!-- 抠图系统配置 -->
<template>
  <div class="app-container">
    <el-card shadow="hover">
      <template #header>
        <span>系统配置</span>
      </template>

      <el-form
        ref="formRef"
        v-loading="loading"
        :model="formData"
        :rules="rules"
        label-width="180px"
        style="max-width: 600px"
      >
        <el-form-item label="新用户初始点数" prop="initial_points">
          <el-input-number
            v-model="formData.initial_points"
            :min="0"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="单次抠图消耗点数" prop="matting_cost">
          <el-input-number
            v-model="formData.matting_cost"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="兑换码默认有效期(天)" prop="redemption_code_default_days">
          <el-input-number
            v-model="formData.redemption_code_default_days"
            :min="1"
            :max="3650"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="兑换码默认赠送点数" prop="redemption_code_default_points">
          <el-input-number
            v-model="formData.redemption_code_default_points"
            :min="1"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import type { RemovebgConfig } from "@/types/api";
import RemovebgAdminAPI from "@/api/removebg";

defineOptions({
  name: "RemovebgConfig",
  inheritAttrs: false,
});

const formRef = ref();
const loading = ref(false);

const formData = reactive<RemovebgConfig>({
  initial_points: 10,
  matting_cost: 1,
  redemption_code_default_days: 30,
  redemption_code_default_points: 10,
});

const rules = reactive({
  initial_points: [{ required: true, message: "请输入新用户初始点数", trigger: "blur" }],
  matting_cost: [{ required: true, message: "请输入单次抠图消耗点数", trigger: "blur" }],
  redemption_code_default_days: [
    { required: true, message: "请输入兑换码默认有效期", trigger: "blur" },
  ],
  redemption_code_default_points: [
    { required: true, message: "请输入兑换码默认赠送点数", trigger: "blur" },
  ],
});

async function fetchConfig() {
  loading.value = true;
  try {
    const data = await RemovebgAdminAPI.getConfig();
    Object.assign(formData, data);
  } catch (error) {
    console.error("获取配置失败:", error);
  } finally {
    loading.value = false;
  }
}

const handleSubmit = useDebounceFn(async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await RemovebgAdminAPI.updateConfig({ ...formData });
    ElMessage.success("配置保存成功");
  } catch (error) {
    console.error("保存配置失败:", error);
  } finally {
    loading.value = false;
  }
}, 300);

onMounted(() => {
  fetchConfig();
});
</script>
