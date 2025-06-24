<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from 'src/stores/user/UserStore'
import { usePartnerStore } from 'src/stores/partner/PartnerStore'
import { useHealthFacilityStore } from 'src/stores/healthFacility/HealthFacilityStore'
import { useProvinceStore } from 'src/stores/province/ProvinceStore'
import { useDistrictStore } from 'src/stores/district/DistrictStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useRoleStore } from 'src/stores/role/RoleStore'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useProfessionalCategoryStore } from 'src/stores/professionalCategory/ProfessionalCategoryStore'
import { useUserTable } from 'src/composables/user/useUserTable'
import UserForm from 'src/components/Users/UserForm.vue'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const userStore = useUserStore()
const partnerStore = usePartnerStore()
const healthFacilityStore = useHealthFacilityStore()
const provinceStore = useProvinceStore()
const districtStore = useDistrictStore()
const roleStore = useRoleStore()
const programStore = useProgramStore()
const professionalCategoryStore = useProfessionalCategoryStore()

const {
  nameFilter,
  pagination,
  users,
  columns,
  roleOptions,
  handleClose,
  fetchUsers,
  deleteUserHandler,
  toggleUserStatusHandler,
  saveUserHandler,
  openEditDialog,
  opneAddDialog,
  selectedUser,
  showUserDialog,
  handleUserSave
} = useUserTable()

onMounted(async () => {
  if (provinceStore.currentPageProvinces.length === 0) await provinceStore.fetchProvinces({ page: 0, size: 100 })
  if (roleStore.getAllRolesAcrossPages.length === 0) await roleStore.fetchAllRoles()
  if (programStore.currentPagePrograms.length === 0) await programStore.fetchPrograms({ page: 0, size: 100 })
  if (professionalCategoryStore.currentPageCategories.length === 0) {
    await professionalCategoryStore.fetchCategories({ page: 0, size: 100 })
  }
  await fetchUsers(0, pagination.value.rowsPerPage)
})

const onRequest = async (props: any) => {
  const { page, rowsPerPage } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage }
  await fetchUsers(page - 1, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await fetchUsers(0, pagination.value.rowsPerPage, name)
}

</script>

<template>
  <EditableTable
    v-model="users"
    title="Utilizadores"
    :columns="columns"
    :loading="userStore.loading"
    v-model:pagination="pagination"
    :program-options="roleOptions"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    :useExternalEdit="true"
    :useExternalAdd="true"
    :hide-delete="true"
    @save="(row, { resolve, reject }) => saveUserHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteUserHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleUserStatusHandler"
    @request="onRequest"
    @edit="openEditDialog"
    @add="opneAddDialog"
  />

  <q-dialog v-model="showUserDialog" persistent style="width: 80%;" >
    <q-card class="q-pa-none" style="min-width: 80%; max-width: 90vw;">
      <UserForm
        :model-value="selectedUser"
        :selected-user="selectedUser"
        @save="handleUserSave"
        @cancel="() => showUserDialog = false"
        @close="handleClose"
      />
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
