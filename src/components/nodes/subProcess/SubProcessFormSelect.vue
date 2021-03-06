<template>
  <div>
    <form-multi-select
      label="Process"
      helper="Select which Process this element calls"
      v-model="selectedProcess"
      :disabled="processList.length === 0"
      :options="processList"
      optionContent="name"
      class="p-0 mb-2"
    />

    <form-multi-select
      label="Start Event"
      v-if="selectedProcess"
      v-model="selectedStartEvent"
      :disabled="startEventList.length === 0"
      :options="startEventList"
      optionContent="name"
      class="p-0 mb-2"
    />

    <a
      v-if="selectedProcess"
      :href="`/modeler/${selectedProcess.id}`"
      target="_blank"
    >
      Open Process
      <i class="ml-1 fas fa-external-link-alt"/>
    </a>
  </div>
</template>

<script>
import store from '@/store';
import uniqBy from 'lodash/uniqBy';

export default {
  data() {
    return {
      selectedProcess: null,
      selectedStartEvent: null,
      config: {},
      name: '',
      loading: false ,
    };
  },
  inheritAttrs: false,
  props: ['value'],
  computed: {
    processList() {
      return store.getters.globalProcesses || [];
    },
    startEventList() {
      if (!this.selectedProcess) { return []; }
      return this.selectedProcess.events;
    },
  },
  watch: {
    selectedProcess() {
      if (this.loading) { return; }
      if (this.startEventList.length > 0) {
        this.selectedStartEvent = this.startEventList[0];
      } else {
        this.selectedStartEvent = null;
      }
    },
    selectedStartEvent() {
      if (this.loading) { return; }
      this.setBpmnValues();
    },
    processList() {
      this.loadBpmnValues();
    },
    value: {
      handler() {
        this.config = JSON.parse(this.value);
      },
      immediate: true,
    },
  },
  methods: {
    loadBpmnValues() {
      if (!this.config.processId || !this.config.startEvent) {
        return;
      }

      this.loading = true;
      this.name = this.config.name;
      this.selectedProcess = this.processList.find(p => p.id === this.config.processId);
      this.selectedStartEvent = this.startEventList.find(se => se.id === this.config.startEvent);
      this.$nextTick(() => {
        this.loading = false;
      });
    },
    setBpmnValues() {
      if (!this.selectedProcess || !this.selectedStartEvent) {
        return;
      }

      let name = this.selectedProcess.name;
      if (this.startEventList.length > 1) {
        name += ` (${this.selectedStartEvent.name})`;
      }

      const emit = {
        calledElement: `${this.selectedStartEvent.ownerProcessId}-${this.selectedProcess.id}`,
        processId: this.selectedProcess.id,
        startEvent: this.selectedStartEvent.id,
        name,
      };
      const stringValue = JSON.stringify(emit);
      this.$emit('input', stringValue);
    },
    containsMultipleProcesses(process) {
      return uniqBy(process.events, 'ownerProcessId').length > 1;
    },
  },
  created() {
    if (this.processList.length === 0) {
      store.dispatch('fetchGlobalProcesses');
    } else {
      this.loadBpmnValues();
    }
  },
};
</script>
