<template>
  <div class="q-pa-md">
    <q-card flat bordered class="bg-grey-1 q-pa-md shadow-1">
      <q-card-section class="row">
        <div class="col-12 col-md-4 q-pr-md">
          <q-card class="rounded-card bg-primary text-white">
            <q-card-section>
              <div class="text-subtitle1">Total de Sessões realizadas</div>
              <div class="text-h4 q-mt-sm">{{ total }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4 q-pr-md">
          <q-card class="rounded-card bg-positive text-white">
            <q-card-section>
              <div class="text-subtitle1">Sessões por Mentores Internos</div>
              <div class="text-h4 q-mt-sm">{{ internos }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="rounded-card bg-secondary text-white">
            <q-card-section>
              <div class="text-subtitle1">Sessões por Mentores Externos</div>
              <div class="text-h4 q-mt-sm">{{ externos }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
    <q-card-actions align="right" class="q-mt-md">
      <q-btn
        label="Exportar para Excel"
        color="primary"
        icon="download"
        @click="exportToExcel"
        flat
      />
    </q-card-actions>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import sessionService from 'src/services/api/session/sessionService';
import { exportSessionReportExcel } from 'src/printables/session/exportSessionReportExcel';

const total = ref(0);
const internos = ref(0);
const externos = ref(0);

const printReport = () => {
  exportSessionReportExcel({
    total: total.value,
    internos: internos.value,
    externos: externos.value,
  });
};

const exportToExcel = async () => {
  try {
    await printReport();
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
  }
};

const loadData = async () => {
  try {
    const data = await sessionService.getSessionReport();
    total.value = data.totalSessions || 0;
    internos.value = data.totalInternalMentorSessions || 0;
    externos.value = data.totalExternalMentorSessions || 0;
  } catch (error) {
    console.error('Erro ao carregar dados do relatório:', error);
  }
};

onMounted(loadData);
</script>

<style scoped>
.rounded-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease-in-out;
}

.rounded-card:hover {
  transform: scale(1.02);
}
</style>
