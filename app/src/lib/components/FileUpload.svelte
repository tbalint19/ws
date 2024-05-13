<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { derived, writable, type Readable } from "svelte/store"
  import axios from "axios"

  export let getUrl: (file: File) => Promise<{ url: string | null, id: string | null } | null>
  export let multiple: boolean = true

  const files = writable<FileList | undefined>()

  type UploadStatus = { filename: string, state: "success" | "error" | "pending", id: string | null }
  const uploadStatuses = writable<UploadStatus[]>([])

  const all = derived([files], (([files]) => files?.length || 0))

  const isUploading = derived([uploadStatuses], ([uploadStatuses]) => uploadStatuses.some(s => s.state === "pending"))

  const successes = derived([uploadStatuses], ([uploadStatuses]) => uploadStatuses.reduce((acc, curr) => curr.state === "success" ? acc+1 : acc , 0))
  const errors = derived([uploadStatuses], ([uploadStatuses]) => uploadStatuses.reduce((acc, curr) => curr.state === "error" ? acc+1 : acc , 0))
  
  type ModuleState = "selecting" | "uploading" | "success" | "error"
  const state: Readable<ModuleState> = derived(
    [uploadStatuses, isUploading, all, successes],
    ([uploadStatuses, isUploading, all, successes]) =>
      !uploadStatuses.length ? "selecting" :
      isUploading ? "uploading" :
      all === successes ? "success" : "error")

  const buttonText = derived([state], ([state]) => state === "error" ? "Try again" : "Upload")
  const buttonNumber = derived([state, errors, all], ([state, errors, all]) => state === "error" ? errors : state === "success" ? 0 : all)
  const buttonDisabled = derived([buttonNumber, isUploading], ([buttonNumber, isUploading]) => !buttonNumber || isUploading)

  const upload = async (file: File) => {
    if ($uploadStatuses.some(s => s.filename === file.name && s.state === "success")) return
    if (!$uploadStatuses.some(s => s.filename === file.name))
      $uploadStatuses = [ { filename: file.name, state: "pending", id: null }, ...$uploadStatuses ]
    else 
      $uploadStatuses = [ { filename: file.name, state: "pending", id: null }, ...$uploadStatuses.filter(s => s.filename !== file.name)]
    const response = await getUrl(file)
    if (!response) return $uploadStatuses = $uploadStatuses.map(s => s.filename === file.name ? { ...s, state: "error" } : s)
    const { url, id } = response
    if (!url || !id) return $uploadStatuses = $uploadStatuses.map(s => s.filename === file.name ? { ...s, state: "error" } : s)
    const uploadResponse = await axios({
      method: "put",
      url,
      data: file,
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read'
      }
    }).catch(() => {})
    if (!uploadResponse) return $uploadStatuses = $uploadStatuses.map(s => s.filename === file.name ? { ...s, state: "error" } : s)
    return $uploadStatuses = $uploadStatuses.map(s => s.filename === file.name ? { ...s, state: "success", id } : s)

  }
  const handleUploads = async () => {
    if (!$files) return
    for (let file of [ ...$files ]) {
      await upload(file)
    }
  }

  const dispatchStateChange = createEventDispatcher<{ stateChange: UploadStatus[] }>()
  uploadStatuses.subscribe(uploadStatuses => dispatchStateChange('stateChange', uploadStatuses))

  const dispatchSuccess = createEventDispatcher<{ success: UploadStatus[] }>()
  const dispatchError = createEventDispatcher<{ error: UploadStatus[] }>()
  state.subscribe(state => {
    if (state === "success") dispatchSuccess('success', $uploadStatuses)
    if (state === "error") dispatchError('error', $uploadStatuses)
  })

  const reset = () => {
    $files = undefined
    $uploadStatuses = []
  }
</script>

<section class="card card-body bg-base-300 text-base-content w-full">
      
  <label class={`w-full p-2 h-40 overflow-scroll shadow-inner rounded-lg bg-base-200`} for="upload">
    <p class="divider font-bold">{$all} {$all === 1 ? "file" : "files"} selected</p>

    {#if $files && $files.length}
    <div>
      {#if !$uploadStatuses.length}
      {#each $files as file}
        <p class="opacity-50">{ file.name }</p>
      {/each}
      {:else}
      {#each $uploadStatuses as status}
        <p class="flex justify-between items-center">
          <span class={status.state === "success" ? "opacity-100" : "opacity-50"}>{status.filename}</span>
          <span>
            {#if status.state === "pending"}
              <div class="loading loading-dots"></div>
            {/if}
            {#if status.state === "success"}
              <span class="text-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path stroke-linecap="round" d="M4 30L9 6h30l5 24"/><path d="M4 30h10.91l1.817 6h14.546l1.818-6H44v13H4z"/><path stroke-linecap="round" d="M19 19.214L23 24l8-8"/></g></svg>
              </span>
            {/if}
            {#if status.state === "error"}
              <span class="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 32 32"><circle cx="11" cy="8" r="1" fill="currentColor"/><circle cx="11" cy="16" r="1" fill="currentColor"/><circle cx="11" cy="24" r="1" fill="currentColor"/><path fill="currentColor" d="M24 3H8a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h10v-2H8v-6h18V5a2 2 0 0 0-2-2m0 16H8v-6h16Zm0-8H8V5h16Z"/><path fill="currentColor" d="M29 24.415L27.586 23L25 25.587L22.414 23L21 24.415L23.586 27L21 29.586L22.414 31L25 28.414L27.586 31L29 29.586L26.414 27z"/></svg>
              </span>
            {/if}
          </span>
        </p>
      {/each}
      {/if}
    </div>
    {:else}
    <div class="flex flex-col justify-center items-center cursor-pointer pt-2">
      <svg class="opacity-25" xmlns="http://www.w3.org/2000/svg" width="4em" height="4em" viewBox="0 0 24 24"><path fill="currentColor" d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m6.16 12.31c-1.56 0-2.97.58-4.05 1.52L6 13.72V19h5.28l-2.13-2.12c.82-.68 1.85-1.1 3.01-1.1c2.07 0 3.84 1.35 4.45 3.22l1.39-.46c-.81-2.45-3.12-4.23-5.84-4.23"/></svg>
    </div>
    {/if}
    
  </label>
  <input accept="image/png, image/jpeg" disabled={$state !== "selecting"} bind:files={$files} id="upload" hidden type="file" {multiple}>
  <div class="flex gap-2">
    <button class="btn btn-error" on:click={reset} disabled={$isUploading}>
      <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 9.77V5h1v3.235q1-1.896 2.851-3.066T12 4q2.739 0 4.849 1.627t2.824 4.142h-1.06q-.696-2.108-2.486-3.438T12 5Q9.979 5 8.36 6.044T5.909 8.77H8.77v1zm3.5 7.73h9.154l-2.827-3.77l-2.615 3.308l-1.75-2.115zM5.616 21q-.672 0-1.144-.472T4 19.385v-6.77h1v6.77q0 .269.173.442t.443.173h12.769q.269 0 .442-.173t.173-.442v-6.77h1v6.77q0 .67-.472 1.143q-.472.472-1.143.472z"/></svg>
    </button>
    <button disabled={$buttonDisabled} class="btn btn-success grow" on:click={handleUploads}>
      {#if $isUploading}
        <div class="loading loading-spinner"></div>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24"><path fill="currentColor" d="M20.986 17c0-.105-.004-.211-.038-.316l-2-6a.996.996 0 0 0-.56-.594a2.995 2.995 0 0 0-.269-3.914L12 .055L5.879 6.176a2.998 2.998 0 0 0-.27 3.914a.987.987 0 0 0-.559.594l-2 6a1.007 1.007 0 0 0-.038.316C3 17 3 22 3 22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1s0-5-.014-5M7.293 7.59L12 2.883l4.707 4.707a.999.999 0 0 1 0 1.414a1.025 1.025 0 0 1-1.414 0L13 6.711V12.5a1 1 0 0 1-2 0V6.711L8.707 9.004a1.025 1.025 0 0 1-1.414 0a.999.999 0 0 1 0-1.414M6.721 12H9v.5c0 1.654 1.346 3 3 3s3-1.346 3-3V12h2.279l1.666 5H5.053zM5 21v-3h14v3z"/></svg>
        {/if}
        {$buttonText} ({$buttonNumber})
      </button>
  </div>
</section>