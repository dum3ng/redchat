(ns redchat.core
  (:require [immutant.web :as s]
            [immutant.web.async :as async]
            [clojure.data.json :as json]
            [redchat.handlers :as h]
            [taoensso.timbre :refer [info error]]
            )
  (:gen-class))

(defn start
  []
  (s/run-dmc h/app))

(defn -main
  [& args]
  (s/run h/app))
