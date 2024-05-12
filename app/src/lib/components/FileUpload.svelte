<script lang="ts">
  import { createEventDispatcher } from "svelte"
	import { writable } from "svelte/store"
  import axios from "axios"

  export let getPresignedUrl: (file: File) => Promise<string | null>
  const dispatch = createEventDispatcher()

  let files: FileList | undefined
  let isUploading = false

  type Status = { filename: string, state: "success" | "error" | "pending" }
  const status = writable<Status[]>([])

  const upload = async (file: File) => {
    if ($status.some(s => s.filename === file.name && s.state === "success")) return
    if (!$status.some(s => s.filename === file.name))
      $status = [ ...$status, { filename: file.name, state: "pending" } ]
    const presignedUrl = await getPresignedUrl(file)
    if (!presignedUrl) return $status = $status.map(s => s.filename === file.name ? { ...s, state: "error" } : s)
    const url = presignedUrl
    if (!url) return $status = $status.map(s => s.filename === file.name ? { ...s, state: "error" } : s)
    const uploadResponse = await axios({
      method: "put",
      url,
      data: file,
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read'
      }
    }).catch(() => {})
    if (!uploadResponse) return $status = $status.map(s => s.filename === file.name ? { ...s, state: "error" } : s)
    return $status = $status.map(s => s.filename === file.name ? { ...s, state: "success" } : s)
  }

  let statusTextShown = false
  let resultShown = false
  const handleUpload = async () => {
    resultShown = false
    statusTextShown = true
    if (!files || !files.length) return
    isUploading = true
    $all = files.length
    for (let file of [ ...files ]) {
      await upload(file)
    }
    isUploading = false
    statusTextShown = false
    resultShown = true
  }

  const all = writable(0)
  const successes = writable(0)
  status.subscribe((status) => $successes = status.reduce((acc, curr) => curr.state === "success" ? acc+1 : acc , 0))

  const errors = writable(0)
  status.subscribe((status) => $errors = status.reduce((acc, curr) => curr.state === "error" ? acc+1 : acc , 0))

  const isSuccess = writable<boolean | null>(false)
  successes.subscribe((successes) => $isSuccess = $all === 0 ? null : successes === $all)

  let buttonText = "Upload"
  isSuccess.subscribe(isSuccess => {
    if (isSuccess) {
      files = undefined
      buttonText = "Upload"
      setTimeout(() => {
        $all = 0
        $status = []
        resultShown = false
      }, 3000)
    }
    if (isSuccess === false) {
      buttonText = "Try again"
    }
  })
</script>

<section class="card card-body bg-base-300 text-base-content min-w-[320px]">
  <button on:click={() => dispatch('close')} class="btn btn-ghost btn-circle absolute top-1 right-1">
    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2c1.3 1.4 2 3.1 2 5.1c0 1.6-.6 3.1-1.6 4.4c-1 1.2-2.4 2.1-4 2.4s-3.2.1-4.6-.7s-2.5-2-3.1-3.5S.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1m.5 12.9c1.3-.3 2.5-1 3.4-2.1c.8-1.1 1.3-2.4 1.2-3.8c0-1.6-.6-3.2-1.7-4.3c-1-1-2.2-1.6-3.6-1.7c-1.3-.1-2.7.2-3.8 1S2.7 4.9 2.3 6.3c-.4 1.3-.4 2.7.2 4q.9 1.95 2.7 3c1.2.7 2.6.9 3.9.6M7.9 7.5L10.3 5l.7.7l-2.4 2.5l2.4 2.5l-.7.7l-2.4-2.5l-2.4 2.5l-.7-.7l2.4-2.5l-2.4-2.5l.7-.7z" clip-rule="evenodd"/></svg>
  </button>
  <h1 class="text-center text-3xl font-bold pt-2">Upload a file</h1>
  <div class="min-h-[40px] text-center my-2 text-sm">
    {#if resultShown}
      <p class={`${$all === $successes ? 'text-success' : 'text-error'} flex justify-center items-center gap-2 font-bold`}>
        {#if $all === $successes}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path stroke-linecap="round" d="M4 30L9 6h30l5 24"/><path d="M4 30h10.91l1.817 6h14.546l1.818-6H44v13H4z"/><path stroke-linecap="round" d="M19 19.214L23 24l8-8"/></g></svg>
          Successfully uploaded {$successes} files
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 32 32"><circle cx="11" cy="8" r="1" fill="currentColor"/><circle cx="11" cy="16" r="1" fill="currentColor"/><circle cx="11" cy="24" r="1" fill="currentColor"/><path fill="currentColor" d="M24 3H8a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h10v-2H8v-6h18V5a2 2 0 0 0-2-2m0 16H8v-6h16Zm0-8H8V5h16Z"/><path fill="currentColor" d="M29 24.415L27.586 23L25 25.587L22.414 23L21 24.415L23.586 27L21 29.586L22.414 31L25 28.414L27.586 31L29 29.586L26.414 27z"/></svg>
          Failed to upload {$errors}/{$all} files
        {/if}
      </p>
    {/if}

    {#if statusTextShown && files && $status.length}
      <p class="flex justify-center w-full items-center font-bold">
        <span class="mr-2 loading loading-spinner loading-xs"></span>
        <span>
          {$successes}/{$all} uploaded 
        </span>
      </p>
    {/if}
  </div>
  <label class={`btn btn-primary w-full ${(isUploading || $isSuccess !== null) ? 'btn-disabled' : ''}`} for="upload">
    <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24"><path fill="currentColor" d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m6.16 12.31c-1.56 0-2.97.58-4.05 1.52L6 13.72V19h5.28l-2.13-2.12c.82-.68 1.85-1.1 3.01-1.1c2.07 0 3.84 1.35 4.45 3.22l1.39-.46c-.81-2.45-3.12-4.23-5.84-4.23"/></svg>
    Select files ({ files?.length || 0 })
  </label>
  <input accept="image/png, image/jpeg" disabled={isUploading || $isSuccess !== null} bind:files id="upload" hidden type="file" multiple>
  <button disabled={isUploading || !files || files.length === 0 || $isSuccess === true} class="btn btn-info w-full" on:click={handleUpload}>
    {#if isUploading}
      <div class="loading loading-spinner"></div>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24"><path fill="currentColor" d="M20.986 17c0-.105-.004-.211-.038-.316l-2-6a.996.996 0 0 0-.56-.594a2.995 2.995 0 0 0-.269-3.914L12 .055L5.879 6.176a2.998 2.998 0 0 0-.27 3.914a.987.987 0 0 0-.559.594l-2 6a1.007 1.007 0 0 0-.038.316C3 17 3 22 3 22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1s0-5-.014-5M7.293 7.59L12 2.883l4.707 4.707a.999.999 0 0 1 0 1.414a1.025 1.025 0 0 1-1.414 0L13 6.711V12.5a1 1 0 0 1-2 0V6.711L8.707 9.004a1.025 1.025 0 0 1-1.414 0a.999.999 0 0 1 0-1.414M6.721 12H9v.5c0 1.654 1.346 3 3 3s3-1.346 3-3V12h2.279l1.666 5H5.053zM5 21v-3h14v3z"/></svg>
      {buttonText}
    {/if}
  </button>
</section>